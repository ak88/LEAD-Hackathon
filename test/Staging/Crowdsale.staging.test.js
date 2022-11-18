const { assert } = require("chai");
const { network, ethers, getNamedAccounts } = require("hardhat");
const { developmentNetworkNames } = require("../../helper-hardhat-config");

developmentNetworkNames.includes(network.name)
  ? describe.skip
  : describe("Crowdsale", () => {
      let paymentValue, leadNft, leadToken, crowdSale, deployer, owner, signer1;
      beforeEach(async function () {
        paymentValue = ethers.utils.parseEther("0.0000000000000001");
        deployer = (await getNamedAccounts()).deployer;
        owner = (await getNamedAccounts()).owner;
        signer1 = (await getNamedAccounts()).signer1;
        leadNft = await ethers.getContract("LeadNFT");
        leadNft = await ethers.getContract("LeadNFT");
        leadToken = await ethers.getContract("LeadToken");
        crowdSale = await ethers.getContract("Crowdsale");
        console.log(
          "Account 1 balance: " + (await ethers.provider.getBalance(deployer))
        );
        console.log(
          "Account 2 balance: " + (await ethers.provider.getBalance(owner))
        );
        console.log(
          "Account 3 balance: " + (await ethers.provider.getBalance(signer1))
        );
      });
      it("tests CrowdSale full flow", async function () {
        //Mint NFT
        const tokenId = 1;
        const noOfTokensToMint = ethers.utils.parseEther("1000");
        console.log("Miniting LEAD NFT.........");
        const leadNftOwner = await leadNft.owner();
        const safeMintTx = await leadNft.safeMint(leadNftOwner, tokenId);
        await safeMintTx.wait(1);
        const leadNftOwnerOfTokenId1 = await leadNft.ownerOf(1);
        assert.equal(leadNftOwner, leadNftOwnerOfTokenId1);
        console.log("Minted");

        //Approve LeadToken to operate the NFT
        console.log(
          "Approving LEAD Token as an operator for LEAD NFT..........."
        );
        const approveTx = await leadNft.setApprovalForAll(
          leadToken.address,
          true
        );
        await approveTx.wait(1);
        console.log("Approved");

        //Fractionalize NFT
        console.log("Fractionalizing NFT......................");
        const fractionTx = leadToken.initialize(
          leadNft.address,
          tokenId,
          crowdSale.address,
          noOfTokensToMint
        );
        await fractionTx.wait(1);
        console.log(
          "Successfully Fractionalized, minted " +
            noOfTokensToMint +
            " ERC20 coints to " +
            crowdSale.address
        );

        //Sell the LEAD tokens
        console.log("Performing crowdsale of LEAD Tokens");
        assert.isFalse(await crowdSale.forSale());
        const forSaleTx = await crowdSale.putForSale();
        await forSaleTx.wait(1);
        assert.isTrue(await crowdSale.forSale());
        console.log("Its official!, LEAD Tokens are for sale");
        //TODO buy the tokens
      });
    });
