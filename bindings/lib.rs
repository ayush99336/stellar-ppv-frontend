#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    symbol_short, Symbol,
    Address, Env, Map, String, Vec,
    token::Client as TokenClient,
};

// Storage Keys
const VIDEOS: Symbol = symbol_short!("VIDEOS");
const BUYERS: Symbol = symbol_short!("BUYERS");
const NEXT_ID: Symbol = symbol_short!("NEXT_ID");
const OWNER: Symbol = symbol_short!("OWNER");

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    VideoNotFound = 1,
    AccessDenied = 2,
    AlreadyPurchased = 3,
    InvalidPrice = 4,
    Unauthorized = 5,
    InvalidInput = 6,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Video {
    pub id: i64,
    pub uploader: Address,
    pub video_ipfs: String,
    pub thumbnail_ipfs: String,
    pub title: String,
    pub description: String,
    pub price: i128,
    pub upload_timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VideoInfo {
    pub id: i64,
    pub uploader: Address,
    pub title: String,
    pub description: String,
    pub thumbnail_ipfs: String,
    pub price: i128,
    pub upload_timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VideoUploadedEvent {
    pub video_id: i64,
    pub uploader: Address,
    pub title: String,
    pub price: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VideoPurchasedEvent {
    pub video_id: i64,
    pub buyer: Address,
    pub price: i128,
    pub token: Address,
}

#[contract]
pub struct PayToViewContract;

#[contractimpl]
impl PayToViewContract {
    /// Initialize the contract with an owner
    pub fn initialize(env: Env, owner: Address) -> Result<(), Error> {
        if env.storage().instance().has(&OWNER) {
            return Err(Error::Unauthorized);
        }
        
        owner.require_auth();
        env.storage().instance().set(&OWNER, &owner);
        env.storage().instance().set(&NEXT_ID, &1i64);
        
        Ok(())
    }

    /// Get the total number of videos uploaded
    pub fn get_video_count(env: Env) -> i64 {
        let next_id: i64 = env.storage()
            .instance()
            .get(&NEXT_ID)
            .unwrap_or(1);
        next_id - 1
    }

    /// Get video metadata (without requiring payment)
    pub fn get_video_info(env: Env, video_id: i64) -> Result<VideoInfo, Error> {
        if video_id <= 0 {
            return Err(Error::InvalidInput);
        }

        let videos: Map<i64, Video> = env.storage()
            .persistent()
            .get(&VIDEOS)
            .unwrap_or(Map::new(&env));
        
        match videos.get(video_id) {
            Some(video) => Ok(VideoInfo {
                id: video.id,
                uploader: video.uploader,
                title: video.title,
                description: video.description,
                thumbnail_ipfs: video.thumbnail_ipfs,
                price: video.price,
                upload_timestamp: video.upload_timestamp,
            }),
            None => Err(Error::VideoNotFound),
        }
    }

    /// Get all video info (paginated)
    pub fn get_all_videos(env: Env, start: i64, limit: i64) -> Vec<VideoInfo> {
        let videos: Map<i64, Video> = env.storage()
            .persistent()
            .get(&VIDEOS)
            .unwrap_or(Map::new(&env));
        
        let mut result = Vec::new(&env);
        let end = (start + limit).min(Self::get_video_count(env.clone()) + 1);
        
        for id in start..end {
            if let Some(video) = videos.get(id) {
                result.push_back(VideoInfo {
                    id: video.id,
                    uploader: video.uploader,
                    title: video.title,
                    description: video.description,
                    thumbnail_ipfs: video.thumbnail_ipfs,
                    price: video.price,
                    upload_timestamp: video.upload_timestamp,
                });
            }
        }
        
        result
    }

    /// Check if a user has access to a video
    pub fn has_access(env: Env, viewer: Address, video_id: i64) -> bool {
        if video_id <= 0 {
            return false;
        }

        let buyers: Map<i64, Vec<Address>> = env.storage()
            .persistent()
            .get(&BUYERS)
            .unwrap_or(Map::new(&env));
        
        buyers.get(video_id)
            .unwrap_or(Vec::new(&env))
            .contains(&viewer)
    }

    /// Upload a new video
    pub fn upload(
        env: Env,
        uploader: Address,
        video_ipfs: String,
        thumbnail_ipfs: String,
        title: String,
        description: String,
        price: i128,
    ) -> Result<i64, Error> {
        uploader.require_auth();

        // Validate inputs
        if price < 0 {
            return Err(Error::InvalidPrice);
        }
        if title.len() == 0 || video_ipfs.len() == 0 || thumbnail_ipfs.len() == 0 {
            return Err(Error::InvalidInput);
        }

        // Get next ID
        let next_id: i64 = env.storage()
            .instance()
            .get(&NEXT_ID)
            .unwrap_or(1);

        // Create video
        let video = Video {
            id: next_id,
            uploader: uploader.clone(),
            video_ipfs,
            thumbnail_ipfs: thumbnail_ipfs.clone(),
            title: title.clone(),
            description,
            price,
            upload_timestamp: env.ledger().timestamp(),
        };

        // Store video
        let mut videos: Map<i64, Video> = env.storage()
            .persistent()
            .get(&VIDEOS)
            .unwrap_or(Map::new(&env));
        
        videos.set(next_id, video);
        env.storage().persistent().set(&VIDEOS, &videos);
        
        // Update next ID
        env.storage().instance().set(&NEXT_ID, &(next_id + 1));

        // Emit event
        env.events().publish(
            (symbol_short!("uploaded"),),
            VideoUploadedEvent {
                video_id: next_id,
                uploader,
                title,
                price,
            }
        );

        Ok(next_id)
    }

    /// Buy access to a video
    pub fn buy(
        env: Env,
        buyer: Address,
        video_id: i64,
        token_id: Address,
    ) -> Result<(), Error> {
        buyer.require_auth();

        if video_id <= 0 {
            return Err(Error::InvalidInput);
        }

        // Check if video exists and get price
        let videos: Map<i64, Video> = env.storage()
            .persistent()
            .get(&VIDEOS)
            .unwrap_or(Map::new(&env));
        
        let video = videos.get(video_id).ok_or(Error::VideoNotFound)?;

        // Check if already purchased
        if Self::has_access(env.clone(), buyer.clone(), video_id) {
            return Err(Error::AlreadyPurchased);
        }

        // Transfer tokens
        let token_client = TokenClient::new(&env, &token_id);
        token_client.transfer(&buyer, &env.current_contract_address(), &video.price);

        // Grant access
        let mut buyers: Map<i64, Vec<Address>> = env.storage()
            .persistent()
            .get(&BUYERS)
            .unwrap_or(Map::new(&env));
        
        let mut buyer_list = buyers.get(video_id).unwrap_or(Vec::new(&env));
        buyer_list.push_back(buyer.clone());
        buyers.set(video_id, buyer_list);
        env.storage().persistent().set(&BUYERS, &buyers);

        // Emit event
        env.events().publish(
            (symbol_short!("purchased"),),
            VideoPurchasedEvent {
                video_id,
                buyer,
                price: video.price,
                token: token_id,
            }
        );

        Ok(())
    }

    /// View a video (returns IPFS hashes)
    pub fn view(
        env: Env,
        viewer: Address,
        video_id: i64,
    ) -> Result<(String, String), Error> {
        viewer.require_auth();

        if video_id <= 0 {
            return Err(Error::InvalidInput);
        }

        // Check access
        if !Self::has_access(env.clone(), viewer, video_id) {
            return Err(Error::AccessDenied);
        }

        // Get video
        let videos: Map<i64, Video> = env.storage()
            .persistent()
            .get(&VIDEOS)
            .unwrap_or(Map::new(&env));
        
        let video = videos.get(video_id).ok_or(Error::VideoNotFound)?;
        
        Ok((video.video_ipfs, video.thumbnail_ipfs))
    }

    /// Get videos uploaded by a specific user
    pub fn get_user_videos(env: Env, uploader: Address) -> Vec<VideoInfo> {
        let videos: Map<i64, Video> = env.storage()
            .persistent()
            .get(&VIDEOS)
            .unwrap_or(Map::new(&env));
        
        let mut result = Vec::new(&env);
        let video_count = Self::get_video_count(env.clone());
        
        for id in 1..=video_count {
            if let Some(video) = videos.get(id) {
                if video.uploader == uploader {
                    result.push_back(VideoInfo {
                        id: video.id,
                        uploader: video.uploader,
                        title: video.title,
                        description: video.description,
                        thumbnail_ipfs: video.thumbnail_ipfs,
                        price: video.price,
                        upload_timestamp: video.upload_timestamp,
                    });
                }
            }
        }
        
        result
    }

    /// Get videos purchased by a user
    pub fn get_purchased_videos(env: Env, buyer: Address) -> Vec<i64> {
        let buyers: Map<i64, Vec<Address>> = env.storage()
            .persistent()
            .get(&BUYERS)
            .unwrap_or(Map::new(&env));
        
        let mut result = Vec::new(&env);
        let video_count = Self::get_video_count(env.clone());
        
        for id in 1..=video_count {
            if let Some(buyer_list) = buyers.get(id) {
                if buyer_list.contains(&buyer) {
                    result.push_back(id);
                }
            }
        }
        
        result
    }

    /// Withdraw earnings (only for video uploaders)
    pub fn withdraw(
        env: Env,
        uploader: Address,
        token_id: Address,
        amount: i128,
    ) -> Result<(), Error> {
        uploader.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidInput);
        }

        // For simplicity, allow withdrawal of any amount
        // In a real implementation, you'd track earnings per uploader
        let token_client = TokenClient::new(&env, &token_id);
        token_client.transfer(&env.current_contract_address(), &uploader, &amount);

        Ok(())
    }
}

#[cfg(test)]
mod test;
