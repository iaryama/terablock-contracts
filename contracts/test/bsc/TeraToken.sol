// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../utils/AccessProtected.sol";

// Tera Block Token
contract TeraToken is ERC20("TeraToken", "TRA"), AccessProtected {
    function mint(address to, uint256 amount) external onlyAdmin {
        _mint(to, amount);
    }

    function getOwner() external view returns (address) {
        return owner();
    }
}
