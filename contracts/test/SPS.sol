// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SPS is ERC20("Splinterlands", "SPS") {
    constructor() public {
        _mint(msg.sender, 240_000_000 ether); // 240M
    }
}
