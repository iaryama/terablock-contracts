// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MultiCoin is ERC20("MultiCoin", "MC") {
    constructor(uint256 amount) public {
        _mint(msg.sender, amount); // 1B
    }
}
