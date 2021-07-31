// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20New is ERC20("ERC20New", "NEW") {
    function mint(address _account, uint256 _amount) external {
        _mint(_account, _amount);
    }
}
