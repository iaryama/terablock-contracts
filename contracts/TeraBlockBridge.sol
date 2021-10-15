// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./utils/ContextMixin.sol";
import "./utils/NativeMetaTransaction.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ITeraBlockToken {
    /**
     * @dev Deposits the TBC Tokens to the user adrress.
     */
    function deposit(address user, bytes calldata depositData) external;
}

// Tera Block Bridge
contract TeraBlockBridge is Pausable, ReentrancyGuard, ContextMixin, NativeMetaTransaction, Ownable {
    ITeraBlockToken token;

    constructor(ITeraBlockToken _token) public {
        _initializeEIP712("TeraBlockBridge", "1");
        token = _token;
    }

    mapping(address => bool) private _admins; // user address => admin? mapping

    event AdminAccessSet(address _admin, bool _enabled);

    /**
     * @notice Set Admin Access
     *
     * @param admin - Address of Minter
     * @param enabled - Enable/Disable Admin Access
     */
    function setAdmin(address admin, bool enabled) external onlyOwner {
        _admins[admin] = enabled;
        emit AdminAccessSet(admin, enabled);
    }

    /**
     * @notice Check Admin Access
     *
     * @param admin - Address of Admin
     * @return whether minter has access
     */
    function isAdmin(address admin) public view returns (bool) {
        return owner() == admin || _admins[admin];
    }

    /**
     * Throws if called by any account other than the Admin.
     */
    modifier onlyAdmin() {
        require(_admins[_msgSender()] || _msgSender() == owner(), "Caller does not have Admin Access");
        _;
    }

    /**
     * This is used instead of msg.sender
     */
    function _msgSender() internal view override returns (address payable) {
        return ContextMixin.msgSender();
    }

    function deposit(address user, uint256 amount) external onlyAdmin nonReentrant whenNotPaused {
        bytes memory depositData = abi.encodePacked(amount);
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
