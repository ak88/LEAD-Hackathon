const { expect, assert } = require("chai");
const { network, getNamedAccounts, ethers, deployments } = require("hardhat");
const { developmentNetworkNames } = require("../../helper-hardhat-config");

!developmentNetworkNames.includes(network.name)
  ? describe.skip
  : describe("Crowdsale contract tests", function () {
      let deployer,
        owner,
        Signer1,
        leadNft,
        leadToken,
        crowdSale,
        mockV3Aggregator;
      beforeEach("Initialization for the test", async () => {
        deployer = (await getNamedAccounts()).deployer;
        owner = (await getNamedAccounts()).owner;
        await deployments.fixture(["all"]);
        Signer1 = (await getNamedAccounts()).signer1;
        leadNft = await ethers.getContract("LeadNFT");
        leadToken = await ethers.getContract("LeadToken");
        crowdSale = await ethers.getContract("Crowdsale");
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
      });

      describe("Constructor tests", function () {
        it("should revert if the price for the coin is 0", async () => {
          const expectedRevertedMessage =
            "Crowdsale: Coin rate must be greater than 0!";
          const crowdSaleFactory = await ethers.getContractFactory("Crowdsale");
          await expect(
            crowdSaleFactory.deploy(
              mockV3Aggregator.address,
              0,
              owner,
              leadNft.address
            )
          ).to.revertedWith(expectedRevertedMessage);
        });
        it("should revert if the wallet address is invalid", async () => {
          const expectedRevertedMessage = "Crowdsale: Invalid wallet address!";
          const crowdSaleFactory = await ethers.getContractFactory("Crowdsale");
          await expect(
            crowdSaleFactory.deploy(
              mockV3Aggregator.address,
              1,
              "0x0000000000000000000000000000000000000000",
              leadNft.address
            )
          ).to.revertedWith(expectedRevertedMessage);
        });
      });

      describe("Crowdsale failure scenario", function () {
        it("should perform the buytoken function and transfer tokens to beneficiary and transfer money to contract wallet", async function () {
          //Arrange
          const sendAmount = ethers.utils.parseEther("10");
          const noOfTokensToMint = ethers.utils.parseEther("1000");
          const leadNftOwner = await leadNft.owner();
          //Mint nft for token id 1
          //Minting nft to the owner of the nft contract
          const nftTx = await leadNft.safeMint(leadNftOwner, 1);
          await nftTx.wait(1);
          assert.equal(await leadNft.ownerOf(1), leadNftOwner);
          //Approve leadToken contract as a operator for LeadNft
          const approveTx = await leadNft.setApprovalForAll(
            leadToken.address,
            true
          );
          await approveTx.wait(1);
          assert.equal(await leadToken.totalSupply(), 0);
          assert.equal(await ethers.provider.getBalance(crowdSale.address), 0);
          //Initialize the leadToken, which will transfer the LeadNft to its own contract address and mints 1000 fractional leadTokens(ERC20) to
          //crowdsale contract, so crowdsale can sell the tokens
          const leadTokenTx = await leadToken.initialize(
            leadNft.address,
            1,
            crowdSale.address,
            noOfTokensToMint
          );
          await leadTokenTx.wait(1);
          assert.equal(await leadNft.ownerOf(1), leadToken.address);
          const totalTokensSupply = await leadToken.totalSupply();
          const totalTokensOwnedByCrowdSale = await leadToken.balanceOf(
            crowdSale.address
          );
          assert.equal(
            totalTokensSupply.toString(),
            totalTokensOwnedByCrowdSale.toString()
          );
          assert.equal(await crowdSale.getCrowdSaleState(), "0");

          await expect(crowdSale.buyTokens(owner)).to.be.revertedWith(
            "Sale is not open!."
          );

          await network.provider.send("evm_increaseTime", [3600]);
          await network.provider.send("evm_mine");
          assert.equal(await crowdSale.getCrowdSaleState(), "1");

          await expect(crowdSale.buyTokens(owner)).to.be.revertedWith(
            "Crowdsale_NotEnoughEthPaid()"
          );

          await expect(
            crowdSale.buyTokens(owner, {
              value: ethers.utils.parseEther("1001"),
            })
          ).to.be.revertedWith("Crowdsale_TooMuchEthPaid()");

          //Act and Assert
          const leadTokensOwnedByOwner = await leadToken.balanceOf(owner);
          await expect(
            crowdSale.buyTokens(owner, { value: sendAmount })
          ).to.emit(crowdSale, "TokenPurchase");

          const weiRaised = await crowdSale.weiRaised();
          const investedAmount = await crowdSale.showInvestedAmount(owner);
          const tokenBalance = await crowdSale.showTokenBalance(owner);

          assert.equal(weiRaised.toString(), sendAmount.toString());
          assert.equal(investedAmount.toString(), sendAmount.toString());
          assert.equal(tokenBalance.toString(), sendAmount.toString());

          let tx = await crowdSale.calculateCrowdSaleResult();
          await tx.wait(1);
          let canRedeemTokens = await crowdSale.canRedeemTokens();
          let canRedeemFunds = await crowdSale.canRedeemFunds();

          await network.provider.send("evm_increaseTime", [7000]);
          await network.provider.send("evm_mine");
          assert.equal("2", await crowdSale.getCrowdSaleState());

          tx = await crowdSale.calculateCrowdSaleResult();
          await tx.wait(1);
          canRedeemTokens = await crowdSale.canRedeemTokens();
          canRedeemFunds = await crowdSale.canRedeemFunds();
          let weiRaisedInUsd = await crowdSale.getWeiRaisedInUSD();

          assert.isTrue(canRedeemTokens);
          assert.isFalse(canRedeemFunds);
        });
      });
      describe("Crowdsale success scenario.", function () {
        it("should pass the full flow", async function () {
          const accounts = await ethers.getSigners();
          const account1 = accounts[1];
          const account2 = accounts[2];
          const account3 = accounts[3];
          //Mint new nft
          tx = await leadNft.safeMint(leadToken.address, 1, "test");
          await tx.wait(1);
          assert.equal(await leadNft.ownerOf(1), leadToken.address);

          //Initialize leadtoken
          tx = await leadToken.fractionalize(leadNft.address, 1);
          await tx.wait(1);
          assert.isTrue(await leadToken.tokenExists(1));
          await expect(
            leadToken.fractionalize(leadNft.address, 1)
          ).to.be.revertedWith("Already fractionalized");

          //Crowdsale
          assert.equal(await crowdSale.getCrowdSaleState(), "0");
          await expect(crowdSale.buyTokens(account1.address)).to.revertedWith(
            "Crowdsale_SaleIsNotOpen()"
          );
          //Increase the block time so the crowd sale state will be open
          //CrowdSaleStates: 0: NotStarted, 1: Open, 2: Closed
          await network.provider.send("evm_increaseTime", [3600]);
          await network.provider.send("evm_mine");
          assert.equal(await crowdSale.getCrowdSaleState(), "1");
          const sendAmount = ethers.utils.parseEther("100");

          //Set crowdsale address as a minter so crowdsale will mint on demand
          tx = await leadToken.setMinter(crowdSale.address);
          await tx.wait(1);
          await expect(
            crowdSale.buyTokens(account1.address, { value: sendAmount })
          ).to.emit(crowdSale, "TokenPurchase");
          const totalSupply = await leadToken.totalSupply();
          const leadTokensOwnedByAccount1 = await leadToken.balanceOf(
            account1.address
          );
          assert.equal(
            totalSupply.toString(),
            leadTokensOwnedByAccount1.toString()
          );

          //Verify token owners cannot transfer the tokens becuase it is paused for transferring.
          const account1LeadToken = await leadToken.connect(account1);
          await expect(
            account1LeadToken.transfer(
              account2.address,
              leadTokensOwnedByAccount1
            )
          ).to.revertedWith("Pausable: paused");

          //Calcualte crowdsale result
          await expect(crowdSale.calculateCrowdSaleResult()).to.be.revertedWith(
            "Crowdsale_SaleIsStillOpen()"
          );
          //Close the sale
          await network.provider.send("evm_increaseTime", [7000]);
          await network.provider.send("evm_mine");
          assert.equal(await crowdSale.getCrowdSaleState(), "2");
          await expect(crowdSale.buyTokens(account1.address)).to.revertedWith(
            "Crowdsale_SaleIsClosed()"
          );

          //Transfer the funds to the wallet
          let crowdSaleBalance = await ethers.provider.getBalance(
            crowdSale.address
          );
          assert.isTrue(crowdSaleBalance != "0");
          tx = await crowdSale.calculateCrowdSaleResult();
          tx.wait(1);
          tx = await crowdSale.transferAmountToWallet();
          await tx.wait(1);
          crowdSaleBalance = await ethers.provider.getBalance(
            crowdSale.address
          );
          assert.isTrue(crowdSaleBalance == "0");
        });
      });
    });
