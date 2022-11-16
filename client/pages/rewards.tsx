import React from 'react'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { Network, Alchemy } from "alchemy-sdk";
import { Wallet } from 'ethers';




const settings = {
    apiKey: "jF1wcxNjYc9CSP2c4GajVeem-s5J_dC8", // Replace with your Alchemy API Key.
    network: Network.ETH_GOERLI, // Replace with your network.
  };
  
  const alchemy = new Alchemy(settings);
  
  export const getStaticProps = async () => {
      const tokenBalances = JSON.parse(JSON.stringify(await alchemy.core.getTokenBalances("")));
    return {
      props: {
        tokenBalances
      }
    }
  
  }