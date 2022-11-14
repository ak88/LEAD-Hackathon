import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";


  export type NftStruct = {
    tokenId: BigNumberish;
    metadataUri: string;
    owner: string;
    price: BigNumberish;
  };

  export type netowrkStruct = {
    chain: string,
    network: string
  }

  export type NftStructOutput = [BigNumber, string, string, BigNumber] & {
    tokenId: BigNumber;
    metadataUri: string;
    owner: string;
    price: BigNumber;
  };

  export type NftCollectionStruct = {
    name: string;
    symbol: string;
    description: string;
    author: string;
    nftContractAddr: string;
    nftsInCollection: Marketplace.NftStruct[];
  };

  export type NftCollectionStructOutput = [
    string,
    string,
    string,
    string,
    string,
    Marketplace.NftStructOutput[]
  ] & {
    name: string;
    symbol: string;
    description: string;
    author: string;
    nftContractAddr: string;
    nftsInCollection: Marketplace.NftStructOutput[];
  };

  export type ZoraCollection = {
    __typename?: string;
    address: string;
    attributes: string
    description: string;
    name: string;
    networkInfo: Marketplace.netowrkStruct[];
    symbol: string;
    totalSupply: number;
  };

  export type ZoraCollectionOutput = [
    string,
    string,
    string,
    string,
    string,
    Marketplace.netowrkStruct[],
    string,
    number
  ] & {
     __typename?: string;
    address: string;
    attributes: string
    description: string;
    name: string;
    networkInfo: Marketplace.netowrkStruct[];
    symbol: string;
    totalSupply: number;
  };
