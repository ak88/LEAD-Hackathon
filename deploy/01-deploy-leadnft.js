const { network, ethers } = require("hardhat");
// const { ethers } = require("ethers");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  // const { deployer } = await getNamedAccounts();
  const accounts = await ethers.getSigners();
  log(
    "----------------------------------------LeadNFT-------------------------------------------------"
  );
  const args = [];
  const leadNft = await deploy("LeadNFT", {
    from: accounts[0].address,
    args: args,
    log: true,
    waitConfirmations: 1,
  });

  log(
    "-------------------------------------LeadNFT Deployed Successfully-------------------------------"
  );
  log("LeadNft address: " + leadNft.address);
};

module.exports.tags = ["all", "nft"];
