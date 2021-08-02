// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Old is ERC20("ERC20Old", "OLD") {
    function mint(address _account, uint256 _amount) external {
        _mint(_account, _amount);
    }
}
