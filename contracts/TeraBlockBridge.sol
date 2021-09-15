// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./utils/AccessProtected.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface ITeraBlockToken {
    /**
     * @dev Deposits the TBC Tokens to the user adrress.
     */
    function deposit(address user, bytes calldata depositData) external;
}

// Tera Block Bridge
contract TeraBlockBridge is AccessProtected, Pausable {
    ITeraBlockToken token;

    constructor(ITeraBlockToken _token) public {
        token = _token;
    }

    function deposit(address user, uint256 amount) external onlyAdmin whenNotPaused {
        bytes memory depositData = new bytes(32);
        assembly {
            mstore(add(depositData, 32), amount)
        }
        token.deposit(user, depositData);
    }

    //
    // IMPLEMENT PAUSABLE FUNCTIONS
    //
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
