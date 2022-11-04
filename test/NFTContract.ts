import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";

describe("NFTContract", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContracts() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("NFTContract");
    const contract = await Contract.deploy();

    return { Contract: contract, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Mint rate should be 1 ether", async function () {
      const { Contract: nft } = await loadFixture(deployContracts);
      
      expect(await nft.mintRate()).to.be.eq(ethers.utils.parseEther("1"));
    });
  });

  describe("safeMint", ()=>{
    it("Owner can mint", async ()=>{
      const { Contract: nft, otherAccount } = await loadFixture(deployContracts);

      await nft.safeMint(otherAccount.address,  1, "abc");
    });

    it("Not owner cannot mint", async ()=>{
      const { Contract: nft, owner, otherAccount } = await loadFixture(deployContracts);
      
      await expect(nft.connect(otherAccount).safeMint(otherAccount.address,  1, "abc")).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Minted NFT belongs to passed address", async ()=>{
      const { Contract: nft, owner, otherAccount } = await loadFixture(deployContracts);

      await nft.safeMint(otherAccount.address,  1, "abc");

      expect(await nft.ownerOf(1)).to.be.eq(otherAccount.address);
    });

    it("Minted NFT has correct uri", async ()=>{
      const { Contract: nft, owner, otherAccount } = await loadFixture(deployContracts);

      const uriValue = "abc";
      await nft.safeMint(otherAccount.address,  1, uriValue);

      expect(await nft.tokenURI(1)).to.be.eq(uriValue);
    });
  });
});
