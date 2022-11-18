/** Hardhat now knows which plugins are activated and we can use them on demand through out the project */

const { version } = require("chai");
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("dotenv").config();
require("@nomiclabs/hardhat-ganache");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("hardhat-deploy");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      { version: "0.8.17" },
      { version: "0.6.6" },
      { version: "0.6.12" },
      { version: "0.4.19" },
    ],
  },
  networks: {
    ganache: {
      url: process.env.GANACHE_RPC_URL,
      accounts: [process.env.GANACHE_PRIVATE_KEY],
      chainId: 1337,
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: [
        process.env.GOERLI_ACCOUNT1,
        process.env.GOERLI_ACCOUNT2,
        process.env.GOERLI_ACCOUNT3,
      ],
      chainId: 5,
      blockConfirmations: 1,
      gas: 30000000, //GWEI
    },
    hardhat: {
      chainId: 31337,
      // forking: {
      //   url: process.env.MAINNET_FORKING_RPC_URL,
      // },
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKET_API_KEY,
    token: "ETH",
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer, this default represents account section in the hardhat account and take 0 index from the account list
    },
    owner: {
      default: 1,
    },
    signer1: {
      default: 2,
    },
  },
  mocha: {
    timeout: 300000, // 300 seconds
  },
};
