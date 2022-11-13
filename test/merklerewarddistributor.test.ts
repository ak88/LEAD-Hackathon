import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, ethers, utils } from "ethers";
import { MerkleTree } from "merkletreejs";
import { toUtf8Bytes } from "@ethersproject/strings";
import { assert } from "console";


describe("MerkleRewardsDistributor", function () {
    async function deployContracts() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();
    
        const Contract = await ethers.getContractFactory("MerkleRewardsDistributor");
        const contract = await Contract.deploy(0);
    
        return { Contract: contract, owner, otherAccount };
      }

    describe("Constructor", ()=>{
        it("Network is set", async ()=>{
            const Contract = await ethers.getContractFactory("MerkleRewardsDistributor");
            const contract = await Contract.deploy(0);

            expect(await contract.network()).to.be.eq(0);
        });
    });

    describe("Relay rewards", ()=>{
        it("Can relay reward", async ()=>{
            const { Contract: nft } = await loadFixture(deployContracts);
            const leaves = [toUtf8Bytes('a'), toUtf8Bytes('b'), toUtf8Bytes('c')].map(x => ethers.utils.keccak256(x));
            const tree = new MerkleTree(leaves, ethers.utils.keccak256);
            const root = ethers.utils.hexlify(tree.getRoot());

            await nft.relayRewards(0, root);
        });

        it("Cannot call same reward index", async ()=>{
            const { Contract: nft } = await loadFixture(deployContracts);
            const leaves = [toUtf8Bytes('a'), toUtf8Bytes('b'), toUtf8Bytes('c')].map(x => ethers.utils.keccak256(x));
            const tree = new MerkleTree(leaves, ethers.utils.keccak256);
            const root = ethers.utils.hexlify(tree.getRoot());

            await nft.relayRewards(0, root);
            await expect(nft.relayRewards(0, root)).to.be.reverted;
        });

        it("Can claim relayed reward", async ()=>{
            const { Contract: nft, owner, otherAccount } = await loadFixture(deployContracts);

            const oneEtherInWei = ethers.utils.parseEther("1");
            
            const leafNode = ethers.utils.solidityPack(["address","uint8","uint256"], [otherAccount.address, 0, oneEtherInWei]);

            const leaves = [leafNode, '0x01', '0x02', '0x03'].map(v => utils.keccak256(v))
            const tree = new MerkleTree(leaves, utils.keccak256, { sort: true })
            const root = tree.getHexRoot()
            const proof = tree.getHexProof(leaves[0])

            nft.relayRewards(0, root, {value: oneEtherInWei});

            const balanceBefore = await ethers.provider.getBalance(otherAccount.address);
            await nft.claimReward(otherAccount.address, [0], [oneEtherInWei], [proof]);
            const balanceAfter = await ethers.provider.getBalance(otherAccount.address);

            expect(balanceAfter).to.be.eq( balanceBefore.add(oneEtherInWei));
        });

        it("Can claim multiple relayed reward", async ()=>{
            const { Contract: nft, owner, otherAccount } = await loadFixture(deployContracts);

            const oneEtherInWei = ethers.utils.parseEther("1");
            let proofs:string[][] = [];
            let rewards:BigNumber[] = [];
            let rewardIndexes:BigNumber[] = [];
            let totalRewardAmount:BigNumber= BigNumber.from(0);

            for (let i = 1; i < 4; i++) {   
                let rewardAmount = oneEtherInWei.mul(i);
                totalRewardAmount = totalRewardAmount.add(rewardAmount);
                rewards.push(rewardAmount);
                rewardIndexes.push(BigNumber.from(i));

	            const leafNode = ethers.utils.solidityPack(["address","uint8","uint256"], [otherAccount.address, 0, rewardAmount]);
	
	            const leaves = [leafNode, '0x01', '0x02', '0x03'].map(v => utils.keccak256(v))
	            const tree = new MerkleTree(leaves, utils.keccak256, { sort: true })
	            const root = tree.getHexRoot()
	            proofs.push( tree.getHexProof(leaves[0]))
	
	            nft.relayRewards(i, root, {value: rewardAmount});
            }

            const balanceBefore = await ethers.provider.getBalance(otherAccount.address);
            await nft.claimReward(otherAccount.address, rewardIndexes, rewards, proofs);
            const balanceAfter = await ethers.provider.getBalance(otherAccount.address);

            expect(balanceAfter).to.be.eq( balanceBefore.add(totalRewardAmount));
        });

        it("Cannot claim reward twice", async ()=>{
            const { Contract: nft, owner, otherAccount } = await loadFixture(deployContracts);

            const oneEtherInWei = ethers.utils.parseEther("1");
            
            const leafNode = ethers.utils.solidityPack(["address","uint8","uint256"], [otherAccount.address, 0, oneEtherInWei]);

            const leaves = [leafNode, '0x01', '0x02', '0x03'].map(v => utils.keccak256(v))
            const tree = new MerkleTree(leaves, utils.keccak256, { sort: true })
            const root = tree.getHexRoot()
            const proof = tree.getHexProof(leaves[0])

            nft.relayRewards(0, root, {value: oneEtherInWei});
            
            await nft.claimReward(otherAccount.address, [0], [oneEtherInWei], [proof]);
            
            await expect(nft.claimReward(otherAccount.address, [0], [oneEtherInWei], [proof])).to.be.revertedWith("Already claimed");
        });

        it("Cannot claim invalid reward amount", async ()=>{
            const { Contract: nft, owner, otherAccount } = await loadFixture(deployContracts);

            const oneEtherInWei = ethers.utils.parseEther("1");
            
            const leafNode = ethers.utils.solidityPack(["address","uint8","uint256"], [otherAccount.address, 0, oneEtherInWei]);

            const leaves = [leafNode, '0x01', '0x02', '0x03'].map(v => utils.keccak256(v))
            const tree = new MerkleTree(leaves, utils.keccak256, { sort: true })
            const root = tree.getHexRoot()
            const proof = tree.getHexProof(leaves[0])

            nft.relayRewards(0, root, {value: oneEtherInWei});

            await expect(nft.claimReward(otherAccount.address, [0], [ethers.utils.parseEther("2")], [proof])).to.be.revertedWith("Invalid proof");
        });

        it("Cannot claim reward with wrong address", async ()=>{
            const { Contract: nft, owner, otherAccount } = await loadFixture(deployContracts);

            const oneEtherInWei = ethers.utils.parseEther("1");
            
            const leafNode = ethers.utils.solidityPack(["address","uint8","uint256"], [otherAccount.address, 0, oneEtherInWei]);

            const leaves = [leafNode, '0x01', '0x02', '0x03'].map(v => utils.keccak256(v))
            const tree = new MerkleTree(leaves, utils.keccak256, { sort: true })
            const root = tree.getHexRoot()
            const proof = tree.getHexProof(leaves[0])

            nft.relayRewards(0, root, {value: oneEtherInWei});

            await expect(nft.claimReward(owner.address, [0], [oneEtherInWei], [proof])).to.be.revertedWith("Invalid proof");
        });

    });

    describe("isClaimed", ()=>{
        it("Returns false if reward not claimed", async ()=>{
            const { Contract: nft, owner, otherAccount } = await loadFixture(deployContracts);

            const oneEtherInWei = ethers.utils.parseEther("1");
            
            const leafNode = ethers.utils.solidityPack(["address","uint8","uint256"], [otherAccount.address, 0, oneEtherInWei]);

            const leaves = [leafNode, '0x01', '0x02', '0x03'].map(v => utils.keccak256(v))
            const tree = new MerkleTree(leaves, utils.keccak256, { sort: true })
            const root = tree.getHexRoot()

            nft.relayRewards(0, root, {value: oneEtherInWei});

            expect(await nft.isClaimed(0, otherAccount.address)).to.be.false;
        });

        it("Returns false if no reward relayed", async ()=>{
            const { Contract: nft, owner, otherAccount } = await loadFixture(deployContracts);

            expect(await nft.isClaimed(0, otherAccount.address)).to.be.false;
        });

        it("Returns true if reward is claimed", async ()=>{
            const { Contract: nft, owner, otherAccount } = await loadFixture(deployContracts);

            const oneEtherInWei = ethers.utils.parseEther("1");
            
            const leafNode = ethers.utils.solidityPack(["address","uint8","uint256"], [otherAccount.address, 0, oneEtherInWei]);

            const leaves = [leafNode, '0x01', '0x02', '0x03'].map(v => utils.keccak256(v))
            const tree = new MerkleTree(leaves, utils.keccak256, { sort: true })
            const root = tree.getHexRoot()
            const proof = tree.getHexProof(leaves[0])

            nft.relayRewards(0, root, {value: oneEtherInWei});

            await nft.claimReward(otherAccount.address, [0], [oneEtherInWei], [proof]);

            expect(await nft.isClaimed(0, otherAccount.address)).to.be.true;
        });
    });
});