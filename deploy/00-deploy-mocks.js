const { network, ethers } = require("hardhat");
// const { ethers } = require("ethers");
const {
  DECIMALS,
  INITIAL_ANSWER,
  developmentNetworkNames,
} = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  // const { deployer } = await getNamedAccounts();
  const accounts = await ethers.getSigners();
  log(
    "------------------------------------Deploying mocks-------------------------------------"
  );
  if (developmentNetworkNames.includes(network.name)) {
    const mockAggregatorV3Interface = await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: accounts[0].address,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log(
      "-------------------------------------Mocks Deployed Successfully-------------------------------"
    );
    log(
      "MockAggregatorV3Interface address: " + mockAggregatorV3Interface.address
    );
  }
};

module.exports.tags = ["all", "mockAggregatorV3Interface"];
