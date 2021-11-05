// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./utils/NativeMetaTransaction.sol";

interface ITeraBlockToken {
    /**
     * @dev Deposits the TBC Tokens to the user adrress.
     */
    function deposit(address user, bytes calldata depositData) external;
}

// Tera Block Bridge
contract TeraBlockBridge is ReentrancyGuard, NativeMetaTransaction {
    ITeraBlockToken public immutable token;

    constructor(ITeraBlockToken _token) public {
        _initializeEIP712("TeraBlockBridge", "1");
        token = _token;
    }

    mapping(string => bool) public burntTxHashes;
    event Deposited(address indexed userAddress, uint256 amount, string indexed burntTxHash);

    function deposit(
        address user,
        uint256 amount,
        string memory burntTxHash
    ) external onlyAdmin(user) nonReentrant whenNotPaused {
        require(burntTxHashes[burntTxHash] == false, "Burnt Tx Hash already exists");
        burntTxHashes[burntTxHash] = true;
        bytes memory depositData = abi.encodePacked(amount);
        token.deposit(user, depositData);
        emit Deposited(user, amount, burntTxHash);
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
