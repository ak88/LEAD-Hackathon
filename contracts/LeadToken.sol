// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

error LeadToken_NotFractionalized();

contract LeadToken is ERC20, Pausable, Ownable, ERC721Holder {
    IERC721 public s_leadNftAddress;
    uint256[] private mintedTokens;
    address public minter;

    constructor() ERC20("LeadToken", "LEAD") {}

    function fractionalize(address _nftAddress, uint256 _tokenId)
        external
        onlyOwner
    {
        require(!tokenExists(_tokenId), "Already fractionalized");
        s_leadNftAddress = IERC721(_nftAddress);
        require(
            s_leadNftAddress.ownerOf(_tokenId) == address(this),
            "LeadToken: fractionalize failed, lead token is not the owner of the nft."
        );
        mintedTokens.push(_tokenId);
        pause();
    }

    function tokenExists(uint256 tokenId) public view returns (bool) {
        for (uint i = 0; i < mintedTokens.length; i++) {
            if (mintedTokens[i] == tokenId) {
                return true;
            }
        }
        return false;
    }

    modifier onlyOwnerOrMinter() {
        require(msg.sender == owner() || msg.sender == minter, "UnAuthorized!");
        _;
    }
    modifier whenNotPausedNonMinters() {
        if (msg.sender != minter) {
            super._requireNotPaused();
        }
        _;
    }

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    function mint(address _beneficiary, uint256 _tokenAmount)
        public
        onlyOwnerOrMinter
    {
        _mint(_beneficiary, _tokenAmount);
    }

    function pause() public onlyOwnerOrMinter {
        _pause();
    }

    function unpause() public onlyOwnerOrMinter {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPausedNonMinters {
        super._beforeTokenTransfer(from, to, amount);
    }
}
