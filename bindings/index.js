import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CBGZEWDUHTGPR4HSGN6Q36FIU46EOTEIYINV7QW2RW35D3JU2S5VBXKZ",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAAElZpZGVvVXBsb2FkZWRFdmVudAAAAAAAAwAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAAAAAAh1cGxvYWRlcgAAABMAAAAAAAAACHZpZGVvX2lkAAAABw==",
            "AAAAAQAAAAAAAAAAAAAAE1ZpZGVvUHVyY2hhc2VkRXZlbnQAAAAABAAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAIdmlkZW9faWQAAAAH",
            "AAAAAAAAACdHZXQgdGhlIHRvdGFsIG51bWJlciBvZiB2aWRlb3MgdXBsb2FkZWQAAAAAD2dldF92aWRlb19jb3VudAAAAAAAAAAAAQAAAAc=",
            "AAAAAAAAAC5HZXQgdmlkZW8gbWV0YWRhdGEgKHdpdGhvdXQgcmVxdWlyaW5nIHBheW1lbnQpAAAAAAAOZ2V0X3ZpZGVvX2luZm8AAAAAAAEAAAAAAAAACHZpZGVvX2lkAAAABwAAAAEAAAPoAAAD7QAAAAIAAAAQAAAACw==",
            "AAAAAAAAACVDaGVjayBpZiBhIHVzZXIgaGFzIGFjY2VzcyB0byBhIHZpZGVvAAAAAAAACmhhc19hY2Nlc3MAAAAAAAIAAAAAAAAABnZpZXdlcgAAAAAAEwAAAAAAAAAIdmlkZW9faWQAAAAHAAAAAQAAAAE=",
            "AAAAAAAAAERBbnlvbmUgdXBsb2FkcyAoSVBGUyB2aWRlbywgdGh1bWJuYWlsLCBwcmljZSkuIFJldHVybnMgbmV3IHZpZGVvIElELgAAAAZ1cGxvYWQAAAAAAAQAAAAAAAAACHVwbG9hZGVyAAAAEwAAAAAAAAAKdmlkZW9faXBmcwAAAAAAEAAAAAAAAAAOdGh1bWJuYWlsX2lwZnMAAAAAABAAAAAAAAAABXByaWNlAAAAAAAACwAAAAEAAAAH",
            "AAAAAAAAAEFCdXllciBwYXlzIGBwcmljZWAgaW4gdGhlIGdpdmVuIGB0b2tlbl9pZGAgYW5kIGdhaW5zIHZpZXcgYWNjZXNzLgAAAAAAAANidXkAAAAAAwAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAAAAAAh2aWRlb19pZAAAAAcAAAAAAAAACHRva2VuX2lkAAAAEwAAAAA=",
            "AAAAAAAAAEFSZXR1cm5zIGAodmlkZW9faXBmcywgdGh1bWJuYWlsX2lwZnMpYCBvbmx5IGlmIGB2aWV3ZXJgIGhhcyBwYWlkLgAAAAAAAAR2aWV3AAAAAgAAAAAAAAAGdmlld2VyAAAAAAATAAAAAAAAAAh2aWRlb19pZAAAAAcAAAABAAAD7QAAAAIAAAAQAAAAEA=="]), options);
        this.options = options;
    }
    fromJSON = {
        get_video_count: (this.txFromJSON),
        get_video_info: (this.txFromJSON),
        has_access: (this.txFromJSON),
        upload: (this.txFromJSON),
        buy: (this.txFromJSON),
        view: (this.txFromJSON)
    };
}
