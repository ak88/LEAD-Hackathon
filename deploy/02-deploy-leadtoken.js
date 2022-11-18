const { network, ethers } = require("hardhat");
// const { ethers } = require("ethers");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  // const { deployer } = await getNamedAccounts();
  const accounts = await ethers.getSigners();
  log(
    "----------------------------------------LeadToken-------------------------------------------------"
  );
  const args = [];
  const leadToken = await deploy("LeadToken", {
    from: accounts[0].address,
    args: args,
    log: true,
    waitConfirmations: 1,
  });

  log(
    "-------------------------------------LeadToken Deployed Successfully-------------------------------"
  );
  log("LeadToken address: " + leadToken.address);
};

module.exports.tags = ["all", "LeadToken"];
