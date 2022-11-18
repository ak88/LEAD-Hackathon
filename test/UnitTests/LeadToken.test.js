const { assert, expect } = require("chai");
const { network, getNamedAccounts, ethers, deployments } = require("hardhat");
const { developmentNetworkNames } = require("../../helper-hardhat-config");

!developmentNetworkNames.includes(network.name)
  ? describe.skip
  : describe("LeadToken tests", function () {
      let deployer, owner, leadNft, leadToken;
      beforeEach("Initialization", async () => {
        deployer = (await getNamedAccounts()).deployer;
        owner = (await getNamedAccounts()).owner;
        leadNft = await ethers.getContract("LeadNFT");
        leadToken = await ethers.getContract("LeadToken");
        //**This call will runs through deployments folder and look for a tag name called 'all' and deploys them */
        await deployments.fixture(["all"]);
      });

      describe("constructor", function () {
        it("should initialize leadToken the contract with correct name and symbol and owner", async function () {
          //Arrange
          const expectedName = "LeadToken";
          const expectedSymbol = "LEAD";
          const expectedOwner = deployer;
          //Act
          const actualName = await leadToken.name();
          const actualSymbol = await leadToken.symbol();
          const actualOwner = await leadToken.owner();
          //Assert
          assert.equal(actualName, expectedName);
          assert.equal(actualSymbol, expectedSymbol);
          assert.equal(actualOwner, expectedOwner);
        });
      });

      it("it should fail when calling initialzie function with token id that is not minted yet.", async function () {
        //Arrange
        const errorMessage = "ERC721: invalid token ID";
        //Act
        //Assert
        await expect(
          leadToken.initialize(leadNft.address, 1)
        ).to.be.revertedWith(errorMessage);
      });

      it("it should fail when lead token contract does not own the lead nft with provided token id.", async function () {
        //Arrange
        const errorMessage =
          "LeadToken: initialze failed, lead token is not the owner of the nft.";
        //Act
        const tx = await leadNft.safeMint(deployer, 1);
        await tx.wait(1);
        //Assert
        assert.equal(await leadNft.owner(), deployer);
        await expect(
          leadToken.initialize(leadNft.address, 1)
        ).to.be.revertedWith(errorMessage);
      });

      it("should initialize correctly when leadtoken contract owns the nft with provided token id", async function () {
        //Arrange
        const expectedErrorMessage = "Already initialized";
        const tx = await leadNft.safeMint(leadToken.address, 1);
        await tx.wait(1);
        //Act
        assert.isFalse(await leadToken.s_initialized());
        const tx2 = await leadToken.initialize(leadNft.address, 1);
        await tx2.wait(1);
        //Assert
        assert.isTrue(await leadToken.s_initialized());
        assert.equal(await leadNft.owner(), deployer);
        assert.equal(await leadNft.ownerOf(1), leadToken.address);
        await expect(leadToken.initialize(leadNft.address, 1)).to.revertedWith(
          expectedErrorMessage
        );
      });
      it("should mint the tokens and can only transfers if it is not paused and initialized", async function () {
        //Arrange
        const accounts = await ethers.getSigners();
        const signer1 = accounts[1];
        const signer2 = accounts[2];
        assert.isFalse(await leadToken.s_initialized());
        assert.equal(await leadToken.owner(), deployer);
        await expect(
          leadToken.transfer(signer1.address, 100)
        ).to.be.revertedWith("LeadToken_NotInitialized()");
        await expect(leadToken.mint(signer1.address, 100)).to.be.revertedWith(
          "LeadToken_NotInitialized()"
        );
        let tx = await leadNft.safeMint(leadToken.address, 1);
        await tx.wait(1);
        assert.equal(await leadNft.ownerOf(1), leadToken.address);
        tx = await leadToken.initialize(leadNft.address, 1);
        await tx.wait(1);
        assert.isTrue(await leadToken.s_initialized());

        //Act & Assert
        assert.equal(await leadToken.totalSupply(), 0);
        assert.equal(await leadToken.balanceOf(signer1.address), 0);

        tx = await leadToken.mint(signer1.address, 100);
        tx.wait(1);
        assert.equal(await leadToken.totalSupply(), 100);
        assert.equal(await leadToken.balanceOf(signer1.address), 100);

        tx = await leadToken.pause();
        await tx.wait(1);

        const signer1LeadToken = await leadToken.connect(signer1);
        assert.equal(await leadToken.balanceOf(signer2.address), 0);
        await expect(
          signer1LeadToken.transfer(signer2.address, 100)
        ).to.be.revertedWith("Pausable: paused");

        tx = await leadToken.unpause();
        await tx.wait(1);
        assert.equal(await leadToken.balanceOf(signer2.address), 0);
        tx = await signer1LeadToken.transfer(signer2.address, 100);
        await tx.wait(1);
        assert.equal(await leadToken.balanceOf(signer2.address), 100);
        assert.equal(await leadToken.balanceOf(signer1.address), 0);
      });
    });
