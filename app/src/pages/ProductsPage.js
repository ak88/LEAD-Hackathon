import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
// @mui
import { Button, Container, Stack, Typography } from '@mui/material';
// components
import { ProductSort, ProductList, ProductCartWidget, ProductFilterSidebar } from '../sections/@dashboard/products';
// mock
import NFTS from '../_mock/products';
import { leadNftAddress, leadNftAbi } from '../constants';

// ----------------------------------------------------------------------
const { ethers } = require('ethers');

export default function ProductsPage() {
  // const listenForTransactionMine = async (txResponse, provider) => {
  //   console.log('Mining with ');
  //   console.log(txResponse.hash);
  //   return new Promise((resolve, reject) => {
  //     provider.once(txResponse.hash, (txReceipt) => {
  //       console.log('Completed with confirmations');
  //       console.log(txReceipt.confirmations);
  //       resolve();
  //     });
  //   });
  // };
  // const loadNFTs = async () => {
  //   if (typeof window.ethereum !== 'undefined') {
  //     console.log('MetaMask Installed');
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  //     const account = accounts[0];
  //     console.log(account);
  //     const leadNft = new ethers.Contract(leadNftAddress, leadNftAbi, signer);
  //     console.log('LeadNft Address');
  //     console.log(leadNft.address);
  //     try {
  //       NFTS.forEach(async (nft, index) => {
  //         const setIndex = index + 1;
  //         console.log('Minting Token Id: ');
  //         console.log(index);
  //         const txResponse = await leadNft.safeMint(account, setIndex, nft.name);
  //         await listenForTransactionMine(txResponse, provider);
  //         console.log('Minted Token Id: ');
  //         console.log(index);
  //       });
  //     } catch (error) {
  //       console.log('Error');
  //       console.log(error);
  //     }
  //   }
  // };
  return (
    <>
      <Helmet>
        <title> Dashboard: Products | Minimal UI </title>
      </Helmet>

      <Container>
        <Typography variant="h1" sx={{ mb: 5 }}>
          NFT
        </Typography>
        {/* <Button onClick={loadNFTs}>Load</Button> */}
        <ProductList products={NFTS} />
      </Container>
    </>
  );
}
