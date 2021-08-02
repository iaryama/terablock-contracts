// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../utils/AccessProtected.sol";

contract TeraNFT is ERC721, AccessProtected {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(string => bool) hashes;

    constructor() public ERC721("Terablock NFT", "TNFT") {}

    /**
     * Mint + Issue NFT
     *
     * @param recipient - NFT will be issued to recipient
     * @param hash - NFT Metadata URI/Data
     * @param URI - NFT Metadata URI/Data
     */
    function issueToken(
        address recipient,
        string memory hash,
        string memory URI
    ) public onlyOwner returns (uint256) {
        require(!hashes[hash], "NFT for hash already minted");
        hashes[hash] = true;
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, URI);
        return newTokenId;
    }
}
