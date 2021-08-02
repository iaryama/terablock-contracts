// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakingToken is ERC20 {
    constructor() public ERC20("Staking", "STK") {
        _mint(msg.sender, 10000000 ether);
    }
}

contract RewardToken is ERC20 {
    constructor() public ERC20("Rewards", "RWD") {
        _mint(msg.sender, 10000000 ether);
    }
}
