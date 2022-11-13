// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ContractStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract MerkleRewardsDistributor is ContractStorage, Ownable{
    
    using SafeMath for uint;
    //Used to prevent replay attacks on other EVM chains
    uint8 public immutable network;
    
    event RewardsClaimed(address indexed claimer, uint256[] rewardIndex, uint256[] amountETH);
    event NewRewardIndex(uint256 indexed rewardIndex);

    constructor(uint8 networkNumber){
        network = networkNumber;
    }
    
    // Allow receiving ETH
    receive() external payable{
        
    }

     function relayRewards(uint256 _rewardIndex, bytes32 _root) external payable onlyOwner{
        bytes32 key = keccak256(abi.encodePacked('rewards.merkle.root', _rewardIndex));
        require(getBytes32(key) == bytes32(0));
        setBytes32(key, _root);
        emit NewRewardIndex(_rewardIndex);
    }

    // can call this method to claim rewards for one or more reward intervals and specify an amount of RPL to stake at the same time
    function claimReward(address _withdrawalAddress, uint256[] calldata _rewardIndex, uint256[] calldata _amountETH, bytes32[][] calldata _merkleProof) public {
        // Verify claims
        _claim(_rewardIndex, _withdrawalAddress, _amountETH, _merkleProof);
        {
            //TODO Check if msg.sender is same as withdrawal?

            // Calculate totals
            uint256 totalAmountETH = 0;
            for (uint256 i = 0; i < _rewardIndex.length; i++) {
                totalAmountETH = totalAmountETH.add(_amountETH[i]);
            }
            // Distribute ETH
            if (totalAmountETH > 0) {
                (bool result,) = _withdrawalAddress.call{value: totalAmountETH}("");
                require(result, "Failed to claim ETH");
            }
        }
        // Emit event
        emit RewardsClaimed(_withdrawalAddress, _rewardIndex, _amountETH);
    }

    // Verifies the given data exists as a leaf nodes for the specified reward interval and marks them as claimed if they are valid
    // Note: this function is optimised for gas when _rewardIndex is ordered numerically
    function _claim(uint256[] calldata _rewardIndex, address _claimantAddress, uint256[] calldata _amountETH, bytes32[][] calldata _merkleProof) internal {
        // Set initial parameters to the first reward index in the array
        uint256 indexWordIndex = _rewardIndex[0] / 256;
        bytes32 claimedWordKey = keccak256(abi.encodePacked('rewards.interval.claimed', _claimantAddress, indexWordIndex));
        uint256 claimedWord = getUint(claimedWordKey);
        // Loop over every entry
        for (uint256 i = 0; i < _rewardIndex.length; i++) {
            // Prevent accidental claim of 0
            require(_amountETH[i] > 0, "Invalid amount");
            // Check if this entry has a different word index than the previous
            if (indexWordIndex != _rewardIndex[i] / 256) {
                // Store the previous word
                setUint(claimedWordKey, claimedWord);
                // Load the word for this entry
                indexWordIndex = _rewardIndex[i] / 256;
                claimedWordKey = keccak256(abi.encodePacked('rewards.interval.claimed', _claimantAddress, indexWordIndex));
                claimedWord = getUint(claimedWordKey);
            }
            // Calculate the bit index for this entry
            uint256 indexBitIndex = _rewardIndex[i] % 256;
            // Ensure the bit is not yet set on this word
            uint256 mask = (1 << indexBitIndex);
            require(claimedWord & mask != mask, "Already claimed");
            // Verify the merkle proof
            require(_verifyProof(_rewardIndex[i], _claimantAddress, _amountETH[i], _merkleProof[i]), "Invalid proof");
            // Set the bit for the current reward index
            claimedWord = claimedWord | (1 << indexBitIndex);
        }
        // Store the word
        setUint(claimedWordKey, claimedWord);
    }

    // Returns true if the given claimer has claimed for the given reward interval
    function isClaimed(uint256 _rewardIndex, address _claimer) public view returns (bool) {
        uint256 indexWordIndex = _rewardIndex / 256;
        uint256 indexBitIndex = _rewardIndex % 256;
        uint256 claimedWord = getUint(keccak256(abi.encodePacked('rewards.interval.claimed', _claimer, indexWordIndex)));
        uint256 mask = (1 << indexBitIndex);
        return claimedWord & mask == mask;
    }

        // Verifies that the
    function _verifyProof(uint256 _rewardIndex, address _claimantAddress, uint256 _amountETH, bytes32[] calldata _merkleProof) internal view returns (bool) {
        bytes memory packed = abi.encodePacked(_claimantAddress, network, _amountETH);
        bytes32 node = keccak256(packed);
        bytes32 key = keccak256(abi.encodePacked('rewards.merkle.root', _rewardIndex));
        bytes32 merkleRoot = getBytes32(key);
        return MerkleProof.verify(_merkleProof, merkleRoot, node);
    }

    function saveRoot(uint _rewardIndex, bytes32 _root) private{
        bytes32 key = keccak256(abi.encodePacked('rewards.merkle.root', _rewardIndex));
        // TODO Check if storage key is empty first?
        setBytes32(key, _root);
    }

    function getRoot(uint _rewardIndex) private view returns (bytes32){
        bytes32 key = keccak256(abi.encodePacked('rewards.merkle.root', _rewardIndex));
        return getBytes32(key);        
    }

}