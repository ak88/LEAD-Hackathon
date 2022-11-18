const { assert, expect } = require("chai");
const { network, getNamedAccounts, ethers, deployments } = require("hardhat");
const { developmentNetworkNames } = require("../../helper-hardhat-config");

!developmentNetworkNames.includes(network.name)
  ? describe.skip
  : describe("LeadNFT tests", function () {
      let leadNft, deployer, owner, signer1;
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        owner = (await getNamedAccounts()).owner;
        signer1 = (await getNamedAccounts()).signer1;
        await deployments.fixture(["all"]);
        leadNft = await ethers.getContract("LeadNFT");
      });

      describe("Constructor", function () {
        it("should initializes contract with correct symbol and name", async function () {
          //Arrange
          const expectedSymbol = "LEADNFT";
          const expectedName = "LeadNFT";
          //Act
          //Assert
          expect(await leadNft.name()).to.equal(expectedName);
          expect(await leadNft.symbol()).to.equal(expectedSymbol);
        });

        it(" must be the deployer", async function () {
          //Arrange
          const expectedAddress = deployer;
          //Act
          const actualAddress = await leadNft.owner();
          //Assert
          assert.equal(actualAddress, expectedAddress);
        });
      });

      describe("safe mint function tests", function () {
        it("should mint a token for a specific address", async function () {
          //Arrange
          const expectedOwner = owner;
          //Act
          const tx = await leadNft.safeMint(owner, 1);
          await tx.wait(1);
          const actualOwner = await leadNft.ownerOf(1);
          //Assert
          assert.equal(actualOwner, expectedOwner);
        });

        it("should fail with an error when non owner calls the function", async function () {
          //Arrange
          const accounts = await ethers.getSigners();
          const attackerAccount = accounts[6];
          const expectedErrorMessage = "Ownable: caller is not the owner";
          //Act
          const attackerConnectedToContract = await leadNft.connect(
            attackerAccount
          );
          //Assert
          await expect(
            attackerConnectedToContract.safeMint(signer1, 1)
          ).to.revertedWith(expectedErrorMessage);
        });
      });
    });
