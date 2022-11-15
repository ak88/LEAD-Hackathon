import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import AppBar from '../components/bars/appbar';
import HomeSection from '../components/sections/home';
import { ZDK, ZDKNetwork, ZDKChain } from "@zoralabs/zdk";
import type { InferGetStaticPropsType } from 'next'
import { ZoraCollection, ZoraCollectionOutput } from '../types/general';


const networkInfo = {
    network: ZDKNetwork.Ethereum,
    chain: ZDKChain.Mainnet,
  }

const API_ENDPOINT = "https://api.zora.co/graphql";
const args = { 
              endPoint:API_ENDPOINT, 
              networks:[networkInfo], 
              apiKey: process.env.API_KEY 
            } 
const zdk = new ZDK(args) 

const address = "0xE169c2ED585e62B1d32615BF2591093A629549b6";

// const collectionsArgs = {
//   where: {collectionAddresses: [
//       "0xE169c2ED585e62B1d32615BF2591093A629549b6",
//       "0x8d04a8c79cEB0889Bdd12acdF3Fa9D207eD3Ff63",
//       "0x82262bFba3E25816b4C720F1070A71C7c16A8fc4"
//     ]
//   },  includeFullDetails: false,
//   sort: {sortKey: sortKey.None, sortDirection: sortDirection.},

// }


export const getStaticProps = async () => {
  const res = await zdk.collection({address})

  return {
    props: {
      res
    }
  }

}


export default function Home({res}: any) {
  console.log(res)
  return (
   <>
   <HomeSection allNft={res} />
   </>
  )
}
