const { getNamedAccounts, ethers, network } = require("hardhat");
const {
  developmentNetworkNames,
  networkConfig,
} = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log, get } = deployments;
  // const deployer = (await getNamedAccounts()).deployer;
  // const owner = (await getNamedAccounts()).owner;
  const accounts = await ethers.getSigners();
  log(
    "--------------------------------------CrowdSale--------------------------------------------"
  );
  log("Fetching LeadToken Contract");
  const leadTokenContract = await ethers.getContract("LeadToken");
  const priceOfEachLeadCoin = 1; //1 lead wei which means for each eth wei, purchaser gets 2 lead coins;
  const tokenSupply = await leadTokenContract.totalSupply();
  const amountToBeRaisedInUSD = 100;
  const openingTime = getMinutes(1);
  const closingTime = getMinutes(120);
  let eth2UsdPriceFeedAddress;
  const chainId = network.config.chainId;
  if (developmentNetworkNames.includes(network.name)) {
    const eth2UsdAggregator = await get("MockV3Aggregator");
    eth2UsdPriceFeedAddress = eth2UsdAggregator.address;
  } else {
    eth2UsdPriceFeedAddress =
      networkConfig[chainId]["ethToUsdPriceFeedAddress"];
  }
  const args = [
    eth2UsdPriceFeedAddress,
    priceOfEachLeadCoin,
    accounts[1].address,
    leadTokenContract.address,
    amountToBeRaisedInUSD,
    openingTime,
    closingTime,
  ];
  const crowdSaleContract = await deploy("Crowdsale", {
    from: accounts[0].address,
    args: args,
    log: true,
    waitConfirmations: 1,
  });
  log(
    "------------------------------Deployed successfully!--------------------------------"
  );
  log("CrowdSale Contract address: " + crowdSaleContract.address);
};

function getMinutes(minutes, date = new Date()) {
  return Math.round((Date.now() + minutes * 60000) / 1000);
}

module.exports.tags = ["all", "CrowdSale"];
