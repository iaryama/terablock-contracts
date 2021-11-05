// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MultiCoinType2Parent is ERC20("MultiCoinType2Parent", "MCT2P") {
    constructor() public {
        _mint(msg.sender, 1_000_000_000 ether); // 1B
    }
}
