#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    symbol_short,
    Address, Env, Map, String, Vec,
    token::Client as TokenClient,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VideoUploadedEvent {
    pub video_id: i64,
    pub uploader: Address,
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
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Get the total number of videos uploaded
    pub fn get_video_count(env: Env) -> i64 {
        let videos: Map<i64, (String, String, i128)> =
            env.storage()
               .persistent()
               .get(&symbol_short!("videos"))
               .unwrap_or(Map::new(&env));
        videos.len() as i64
    }

    /// Get video metadata (without requiring payment)
    pub fn get_video_info(env: Env, video_id: i64) -> Option<(String, i128)> {
        let videos: Map<i64, (String, String, i128)> =
            env.storage()
               .persistent()
               .get(&symbol_short!("videos"))
               .unwrap_or(Map::new(&env));
        
        videos.get(video_id).map(|(_, thumbnail_ipfs, price)| (thumbnail_ipfs, price))
    }

    /// Check if a user has access to a video
    pub fn has_access(env: Env, viewer: Address, video_id: i64) -> bool {
        let buyers: Map<i64, Vec<Address>> =
            env.storage()
               .persistent()
               .get(&symbol_short!("buyers"))
               .unwrap_or(Map::new(&env));
        
        buyers.get(video_id).unwrap_or(Vec::new(&env)).contains(&viewer)
    }

    /// Anyone uploads (IPFS video, thumbnail, price). Returns new video ID.
    pub fn upload(
        env: Env,
        uploader: Address,
        video_ipfs: String,
        thumbnail_ipfs: String,
        price: i128,
    ) -> i64 {
        // 1️⃣ Auth the uploader
        uploader.require_auth();

        // 2️⃣ Load-or-init videos map: id → (video_ipfs, thumbnail_ipfs, price)
        let mut videos: Map<i64, (String, String, i128)> =
            env.storage()
               .persistent()
               .get(&symbol_short!("videos"))
               .unwrap_or(Map::new(&env));

        // 3️⃣ Bump ID and store
        let new_id: i64 = (videos.len() as i64) + 1;
        videos.set(new_id, (video_ipfs.clone(), thumbnail_ipfs.clone(), price));
        env.storage()
           .persistent()
           .set(&symbol_short!("videos"), &videos);

        // Emit event
        env.events().publish((symbol_short!("uploaded"),), VideoUploadedEvent {
            video_id: new_id,
            uploader: uploader.clone(),
            price,
        });

        new_id
    }

    /// Buyer pays `price` in the given `token_id` and gains view access.
    pub fn buy(
        env: Env,
        buyer: Address,
        video_id: i64,
        token_id: Address,
    ) {
        buyer.require_auth();

        // 1️⃣ Fetch price
        let videos: Map<i64, (String, String, i128)> =
            env.storage()
               .persistent()
               .get(&symbol_short!("videos"))
               .expect("No videos found");
        let (_, _, price) = videos.get(video_id).expect("Video not found");

        // 2️⃣ Transfer native XLM (or any token) into this contract
        let token_client = TokenClient::new(&env, &token_id);
        token_client.transfer(&buyer, &env.current_contract_address(), &price);

        // 3️⃣ Record buyer in access list
        let mut buyers: Map<i64, Vec<Address>> =
            env.storage()
               .persistent()
               .get(&symbol_short!("buyers"))
               .unwrap_or(Map::new(&env));
        let mut list = buyers.get(video_id).unwrap_or(Vec::new(&env));
        
        // Check if user already has access
        if !list.contains(&buyer) {
            list.push_back(buyer.clone());
            buyers.set(video_id, list);
            env.storage()
               .persistent()
               .set(&symbol_short!("buyers"), &buyers);

            // Emit event
            env.events().publish((symbol_short!("purchased"),), VideoPurchasedEvent {
                video_id,
                buyer: buyer.clone(),
                price,
                token: token_id,
            });
        }
    }

    /// Returns `(video_ipfs, thumbnail_ipfs)` only if `viewer` has paid.
    pub fn view(
        env: Env,
        viewer: Address,
        video_id: i64,
    ) -> (String, String) {
        viewer.require_auth();

        // 1️⃣ Check access
        let buyers: Map<i64, Vec<Address>> =
            env.storage()
               .persistent()
               .get(&symbol_short!("buyers"))
               .unwrap_or(Map::new(&env));
        if !buyers.get(video_id).unwrap_or(Vec::new(&env)).contains(&viewer) {
            panic!("Access denied: User has not purchased this video");
        }

        // 2️⃣ Fetch and return IPFS hashes
        let videos: Map<i64, (String, String, i128)> =
            env.storage()
               .persistent()
               .get(&symbol_short!("videos"))
               .expect("No videos found");
        let (video_ipfs, thumbnail_ipfs, _) = videos.get(video_id).expect("Video not found");
        (video_ipfs, thumbnail_ipfs)
    }
}

mod test;
