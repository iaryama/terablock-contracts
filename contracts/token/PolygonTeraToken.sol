// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../utils/AccessProtected.sol";

// Tera Token
contract PolygonTeraToken is ERC20("TeraToken", "TRA"), AccessProtected {
    struct BurntTokens {
        uint256 currentBurntTokens;
        uint256 totalBurntTokens;
        bool isBurnt;
    }
    mapping(address => BurntTokens) private burntTokens;

    function mint(address to, uint256 amount) external onlyAdmin {
        _mint(to, amount);
    }

    function transferTokensToBSC(uint256 amount) external returns (bool) {
        require(amount != 0, "Cant Transfer 0 tokens");
        require(burntTokens[_msgSender()].isBurnt == false, "Tokens are already Burnt.");
        _burn(_msgSender(), amount);
        burntTokens[_msgSender()].currentBurntTokens = amount;
        burntTokens[_msgSender()].totalBurntTokens += amount;
        burntTokens[_msgSender()].isBurnt = true;
        return true;
    }

    function releasedTokensToBSC(address userAddress) external onlyAdmin returns (bool) {
        burntTokens[userAddress].isBurnt = false;
        burntTokens[_msgSender()].currentBurntTokens = 0;
        return true;
    }

    function getCurrentState(address userAddress)
        external
        view
        onlyAdmin
        returns (
            uint256 _currentBurntTokens,
            uint256 _totalBurntTokens,
            bool _isBurnt
        )
    {
        return (
            burntTokens[userAddress].currentBurntTokens,
            burntTokens[userAddress].totalBurntTokens,
            burntTokens[userAddress].isBurnt
        );
    }
}
