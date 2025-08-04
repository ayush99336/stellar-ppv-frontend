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
    contractId: "CBGZEWDUHTGPR4HSGN6Q36FIU46EOTEIYINV7QW2RW35D3JU2S5VBXKZ",
  }
} as const


export interface VideoUploadedEvent {
  price: i128;
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
  }) => Promise<AssembledTransaction<Option<readonly [string, i128]>>>

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
   * Anyone uploads (IPFS video, thumbnail, price). Returns new video ID.
   */
  upload: ({uploader, video_ipfs, thumbnail_ipfs, price}: {uploader: string, video_ipfs: string, thumbnail_ipfs: string, price: i128}, options?: {
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
   * Construct and simulate a buy transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Buyer pays `price` in the given `token_id` and gains view access.
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
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a view transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns `(video_ipfs, thumbnail_ipfs)` only if `viewer` has paid.
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
  }) => Promise<AssembledTransaction<readonly [string, string]>>

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
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAAElZpZGVvVXBsb2FkZWRFdmVudAAAAAAAAwAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAAAAAAh1cGxvYWRlcgAAABMAAAAAAAAACHZpZGVvX2lkAAAABw==",
        "AAAAAQAAAAAAAAAAAAAAE1ZpZGVvUHVyY2hhc2VkRXZlbnQAAAAABAAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAIdmlkZW9faWQAAAAH",
        "AAAAAAAAACdHZXQgdGhlIHRvdGFsIG51bWJlciBvZiB2aWRlb3MgdXBsb2FkZWQAAAAAD2dldF92aWRlb19jb3VudAAAAAAAAAAAAQAAAAc=",
        "AAAAAAAAAC5HZXQgdmlkZW8gbWV0YWRhdGEgKHdpdGhvdXQgcmVxdWlyaW5nIHBheW1lbnQpAAAAAAAOZ2V0X3ZpZGVvX2luZm8AAAAAAAEAAAAAAAAACHZpZGVvX2lkAAAABwAAAAEAAAPoAAAD7QAAAAIAAAAQAAAACw==",
        "AAAAAAAAACVDaGVjayBpZiBhIHVzZXIgaGFzIGFjY2VzcyB0byBhIHZpZGVvAAAAAAAACmhhc19hY2Nlc3MAAAAAAAIAAAAAAAAABnZpZXdlcgAAAAAAEwAAAAAAAAAIdmlkZW9faWQAAAAHAAAAAQAAAAE=",
        "AAAAAAAAAERBbnlvbmUgdXBsb2FkcyAoSVBGUyB2aWRlbywgdGh1bWJuYWlsLCBwcmljZSkuIFJldHVybnMgbmV3IHZpZGVvIElELgAAAAZ1cGxvYWQAAAAAAAQAAAAAAAAACHVwbG9hZGVyAAAAEwAAAAAAAAAKdmlkZW9faXBmcwAAAAAAEAAAAAAAAAAOdGh1bWJuYWlsX2lwZnMAAAAAABAAAAAAAAAABXByaWNlAAAAAAAACwAAAAEAAAAH",
        "AAAAAAAAAEFCdXllciBwYXlzIGBwcmljZWAgaW4gdGhlIGdpdmVuIGB0b2tlbl9pZGAgYW5kIGdhaW5zIHZpZXcgYWNjZXNzLgAAAAAAAANidXkAAAAAAwAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAAAAAAh2aWRlb19pZAAAAAcAAAAAAAAACHRva2VuX2lkAAAAEwAAAAA=",
        "AAAAAAAAAEFSZXR1cm5zIGAodmlkZW9faXBmcywgdGh1bWJuYWlsX2lwZnMpYCBvbmx5IGlmIGB2aWV3ZXJgIGhhcyBwYWlkLgAAAAAAAAR2aWV3AAAAAgAAAAAAAAAGdmlld2VyAAAAAAATAAAAAAAAAAh2aWRlb19pZAAAAAcAAAABAAAD7QAAAAIAAAAQAAAAEA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_video_count: this.txFromJSON<i64>,
        get_video_info: this.txFromJSON<Option<readonly [string, i128]>>,
        has_access: this.txFromJSON<boolean>,
        upload: this.txFromJSON<i64>,
        buy: this.txFromJSON<null>,
        view: this.txFromJSON<readonly [string, string]>
  }
}