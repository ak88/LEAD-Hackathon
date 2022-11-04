// SPDX-License-Identifier: MIT

pragma solidity >=0.8.17 <0.9.0;

import "@openzeppelin/contracts@4.7.3/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.7.3/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.7.3/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts@4.7.3/access/Ownable.sol";

contract FarmlandSkane is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    constructor() ERC721("Farmland Skane", "FLS") {}

    uint256 public mintRate = 1 ether;

    function safeMint(address to, uint256 tokenId, string memory uri)
        public payable
    {   
        require (msg.value >= mintRate, "Not enough ether sent.");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "Balance is 0");
        payable(owner()).transfer(address(this).balance);
    }
}