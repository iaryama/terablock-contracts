// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MultiCoinWithBurnMint is ERC20("MultiCoinWithBurnMint", "MCWBM"), Ownable {
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 _amount) external {
        _burn(_msgSender(), _amount);
    }
}
