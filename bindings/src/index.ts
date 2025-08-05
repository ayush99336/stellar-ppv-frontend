import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CA5EGWJXEVHCVWIYQG32KFQHABW2WVXQUKLCLF2ORRDOTIFH3RJ7H2H2",
  }
} as const

export const Errors = {
  1: {message:"VideoNotFound"},
  2: {message:"AccessDenied"},
  3: {message:"AlreadyPurchased"},
  4: {message:"InvalidPrice"},
  5: {message:"Unauthorized"},
  6: {message:"InvalidInput"}
}


export interface Video {
  description: string;
  id: i64;
  price: i128;
  thumbnail_ipfs: string;
  title: string;
  upload_timestamp: u64;
  uploader: string;
  video_ipfs: string;
}


export interface VideoInfo {
  description: string;
  id: i64;
  price: i128;
  thumbnail_ipfs: string;
  title: string;
  upload_timestamp: u64;
  uploader: string;
}


export interface VideoUploadedEvent {
  price: i128;
  title: string;
  uploader: string;
  video_id: i64;
}


export interface VideoPurchasedEvent {
  buyer: string;
  price: i128;
  token: string;
  video_id: i64;
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the contract with an owner
   */
  initialize: ({owner}: {owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_video_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the total number of videos uploaded
   */
  get_video_count: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i64>>

  /**
   * Construct and simulate a get_video_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get video metadata (without requiring payment)
   */
  get_video_info: ({video_id}: {video_id: i64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<VideoInfo>>>

  /**
   * Construct and simulate a get_all_videos transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all video info (paginated)
   */
  get_all_videos: ({start, limit}: {start: i64, limit: i64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<VideoInfo>>>

  /**
   * Construct and simulate a has_access transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check if a user has access to a video
   */
  has_access: ({viewer, video_id}: {viewer: string, video_id: i64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a upload transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Upload a new video
   */
  upload: ({uploader, video_ipfs, thumbnail_ipfs, title, description, price}: {uploader: string, video_ipfs: string, thumbnail_ipfs: string, title: string, description: string, price: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<i64>>>

  /**
   * Construct and simulate a buy transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Buy access to a video
   */
  buy: ({buyer, video_id, token_id}: {buyer: string, video_id: i64, token_id: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a view transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * View a video (returns IPFS hashes)
   */
  view: ({viewer, video_id}: {viewer: string, video_id: i64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<readonly [string, string]>>>

  /**
   * Construct and simulate a get_user_videos transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get videos uploaded by a specific user
   */
  get_user_videos: ({uploader}: {uploader: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<VideoInfo>>>

  /**
   * Construct and simulate a get_purchased_videos transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get videos purchased by a user
   */
  get_purchased_videos: ({buyer}: {buyer: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<i64>>>

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Withdraw earnings (only for video uploaders)
   */
  withdraw: ({uploader, token_id, amount}: {uploader: string, token_id: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABgAAAAAAAAANVmlkZW9Ob3RGb3VuZAAAAAAAAAEAAAAAAAAADEFjY2Vzc0RlbmllZAAAAAIAAAAAAAAAEEFscmVhZHlQdXJjaGFzZWQAAAADAAAAAAAAAAxJbnZhbGlkUHJpY2UAAAAEAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAAFAAAAAAAAAAxJbnZhbGlkSW5wdXQAAAAG",
        "AAAAAQAAAAAAAAAAAAAABVZpZGVvAAAAAAAACAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAACaWQAAAAAAAcAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAOdGh1bWJuYWlsX2lwZnMAAAAAABAAAAAAAAAABXRpdGxlAAAAAAAAEAAAAAAAAAAQdXBsb2FkX3RpbWVzdGFtcAAAAAYAAAAAAAAACHVwbG9hZGVyAAAAEwAAAAAAAAAKdmlkZW9faXBmcwAAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAACVZpZGVvSW5mbwAAAAAAAAcAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAAAmlkAAAAAAAHAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAAAAAADnRodW1ibmFpbF9pcGZzAAAAAAAQAAAAAAAAAAV0aXRsZQAAAAAAABAAAAAAAAAAEHVwbG9hZF90aW1lc3RhbXAAAAAGAAAAAAAAAAh1cGxvYWRlcgAAABM=",
        "AAAAAQAAAAAAAAAAAAAAElZpZGVvVXBsb2FkZWRFdmVudAAAAAAABAAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAAAAAAV0aXRsZQAAAAAAABAAAAAAAAAACHVwbG9hZGVyAAAAEwAAAAAAAAAIdmlkZW9faWQAAAAH",
        "AAAAAQAAAAAAAAAAAAAAE1ZpZGVvUHVyY2hhc2VkRXZlbnQAAAAABAAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAIdmlkZW9faWQAAAAH",
        "AAAAAAAAACVJbml0aWFsaXplIHRoZSBjb250cmFjdCB3aXRoIGFuIG93bmVyAAAAAAAACmluaXRpYWxpemUAAAAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAACdHZXQgdGhlIHRvdGFsIG51bWJlciBvZiB2aWRlb3MgdXBsb2FkZWQAAAAAD2dldF92aWRlb19jb3VudAAAAAAAAAAAAQAAAAc=",
        "AAAAAAAAAC5HZXQgdmlkZW8gbWV0YWRhdGEgKHdpdGhvdXQgcmVxdWlyaW5nIHBheW1lbnQpAAAAAAAOZ2V0X3ZpZGVvX2luZm8AAAAAAAEAAAAAAAAACHZpZGVvX2lkAAAABwAAAAEAAAPpAAAH0AAAAAlWaWRlb0luZm8AAAAAAAAD",
        "AAAAAAAAAB5HZXQgYWxsIHZpZGVvIGluZm8gKHBhZ2luYXRlZCkAAAAAAA5nZXRfYWxsX3ZpZGVvcwAAAAAAAgAAAAAAAAAFc3RhcnQAAAAAAAAHAAAAAAAAAAVsaW1pdAAAAAAAAAcAAAABAAAD6gAAB9AAAAAJVmlkZW9JbmZvAAAA",
        "AAAAAAAAACVDaGVjayBpZiBhIHVzZXIgaGFzIGFjY2VzcyB0byBhIHZpZGVvAAAAAAAACmhhc19hY2Nlc3MAAAAAAAIAAAAAAAAABnZpZXdlcgAAAAAAEwAAAAAAAAAIdmlkZW9faWQAAAAHAAAAAQAAAAE=",
        "AAAAAAAAABJVcGxvYWQgYSBuZXcgdmlkZW8AAAAAAAZ1cGxvYWQAAAAAAAYAAAAAAAAACHVwbG9hZGVyAAAAEwAAAAAAAAAKdmlkZW9faXBmcwAAAAAAEAAAAAAAAAAOdGh1bWJuYWlsX2lwZnMAAAAAABAAAAAAAAAABXRpdGxlAAAAAAAAEAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAQAAA+kAAAAHAAAAAw==",
        "AAAAAAAAABVCdXkgYWNjZXNzIHRvIGEgdmlkZW8AAAAAAAADYnV5AAAAAAMAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAAAAAAIdmlkZW9faWQAAAAHAAAAAAAAAAh0b2tlbl9pZAAAABMAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAACJWaWV3IGEgdmlkZW8gKHJldHVybnMgSVBGUyBoYXNoZXMpAAAAAAAEdmlldwAAAAIAAAAAAAAABnZpZXdlcgAAAAAAEwAAAAAAAAAIdmlkZW9faWQAAAAHAAAAAQAAA+kAAAPtAAAAAgAAABAAAAAQAAAAAw==",
        "AAAAAAAAACZHZXQgdmlkZW9zIHVwbG9hZGVkIGJ5IGEgc3BlY2lmaWMgdXNlcgAAAAAAD2dldF91c2VyX3ZpZGVvcwAAAAABAAAAAAAAAAh1cGxvYWRlcgAAABMAAAABAAAD6gAAB9AAAAAJVmlkZW9JbmZvAAAA",
        "AAAAAAAAAB5HZXQgdmlkZW9zIHB1cmNoYXNlZCBieSBhIHVzZXIAAAAAABRnZXRfcHVyY2hhc2VkX3ZpZGVvcwAAAAEAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAEAAAPqAAAABw==",
        "AAAAAAAAACxXaXRoZHJhdyBlYXJuaW5ncyAob25seSBmb3IgdmlkZW8gdXBsb2FkZXJzKQAAAAh3aXRoZHJhdwAAAAMAAAAAAAAACHVwbG9hZGVyAAAAEwAAAAAAAAAIdG9rZW5faWQAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAA+0AAAAAAAAAAw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
        get_video_count: this.txFromJSON<i64>,
        get_video_info: this.txFromJSON<Result<VideoInfo>>,
        get_all_videos: this.txFromJSON<Array<VideoInfo>>,
        has_access: this.txFromJSON<boolean>,
        upload: this.txFromJSON<Result<i64>>,
        buy: this.txFromJSON<Result<void>>,
        view: this.txFromJSON<Result<readonly [string, string]>>,
        get_user_videos: this.txFromJSON<Array<VideoInfo>>,
        get_purchased_videos: this.txFromJSON<Array<i64>>,
        withdraw: this.txFromJSON<Result<void>>
  }
}