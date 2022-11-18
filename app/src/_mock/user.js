import { faker } from '@faker-js/faker';
import { sample } from 'lodash';
import { useEffect, useState } from 'react';
import { leadNftAddress, leadNftAbi } from '../constants';

// ----------------------------------------------------------------------
const { ethers } = require('ethers');

const NFT_NAME = [
  'Tower 1',
  'Tower 2',
  'Tower 3',
  'Tower 4',
  'Tower 5',
  'Tower 6',
  'Tower 7',
  'Tower 8',
  'Tower 9',
  'Tower 10',
  'Tower 11',
  'Tower 12',
  'Tower 13',
  'Tower 14',
  'Tower 15',
  'Tower 16',
  'Tower 17',
  'Tower 18',
  'Tower 19',
  'Tower 20',
  'Tower 21',
  'Tower 22',
  'Tower 23',
  'Tower 24',
];
const TOKEN_IDS = [
  'Token - 1',
  'Token - 2',
  'Token - 3',
  'Token - 4',
  'Token - 5',
  'Token - 6',
  'Token - 7',
  'Token - 8',
  'Token - 9',
  'Token - 10',
  'Token - 11',
  'Token - 12',
  'Token - 13',
  'Token - 14',
  'Token - 15',
  'Token - 16',
  'Token - 17',
  'Token - 18',
  'Token - 19',
  'Token - 20',
  'Token - 21',
  'Token - 22',
  'Token - 23',
  'Token - 24',
];
const NFT_COLOR = ['#00AB55', '#000000', '#FFFFFF', '#FFC0CB', '#FF4842', '#1890FF', '#94D82D', '#FFC107'];

const isMetaMaskInstalled = async () => {
  if (typeof window.ethereum !== 'undefined') {
    await window.ethereum.enable();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    console.log(account);
    window.ethereum.on('accountsChanged', (accounts) => {
      console.log(accounts[0]);
    });
    console.log('Connected');
    return true;
  }
  return false;
};
async function loadNFTs() {
  if (await isMetaMaskInstalled()) {
    console.log('MetaMask Installed and logged in');
    const ethAmount = document.getElementById('ethAmount').value;
    const leadNft = new ethers.Contract(leadNftAddress, leadNftAbi, window.ethereum);
    console.log('LeadNft Address');
  }
}

// ----------------------------------------------------------------------

const nfts = [...Array(24)].map((_, index) => {
  const setIndex = index + 1;
  // loadNFTs();
  return {
    id: index,
    avatarUrl: `/assets/images/Nfts/Tower_${setIndex}.png`,
    towerName: NFT_NAME[index],
    tokenId: `TokenId: ${setIndex}`,
    isVerified: true,
    // priceSale: `TokenId: ${setIndex}`,
    status: sample(['CrowdSale', 'Closed', 'CrowdSale', 'Closed']),
    rewards: true,
  };
});

export default nfts;

// const users = [...Array(24)].map((_, index) => ({
//   id: faker.datatype.uuid(),
//   avatarUrl: `/assets/images/avatars/avatar_${index + 1}.jpg`,
//   name: faker.name.fullName(),
//   company: faker.company.name(),
//   isVerified: faker.datatype.boolean(),
//   status: sample(['active', 'banned']),
//   role: sample([
//     'Leader',
//     'Hr Manager',
//     'UI Designer',
//     'UX Designer',
//     'UI/UX Designer',
//     'Project Manager',
//     'Backend Developer',
//     'Full Stack Designer',
//     'Front End Developer',
//     'Full Stack Developer',
//   ]),
// }));

// export default users;
