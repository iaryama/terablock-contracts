// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./utils/NativeMetaTransaction.sol";

interface ITeraBlockToken {
    /**
     * @dev Deposits the TBC Tokens to the user adrress.
     */
    function deposit(address user, bytes calldata depositData) external;
}

// Tera Block Bridge
contract TeraBlockBridge is ReentrancyGuard, Ownable, Pausable, NativeMetaTransaction {
    ITeraBlockToken public immutable token;

    constructor(ITeraBlockToken _token) public {
        _initializeEIP712("TeraBlockBridge", "1");
        token = _token;
    }

    mapping(string => bool) public burntTxHashes;
    mapping(address => bool) public _admins; // user address => admin? mapping
    event AdminAccessSet(address _admin, bool _enabled);
    event Deposited(address indexed userAddress, uint256 amount, string indexed burntTxHash);

    function deposit(
        address user,
        uint256 amount,
        string memory burntTxHash
    ) external onlyAdmin nonReentrant whenNotPaused {
        require(burntTxHashes[burntTxHash] == false, "Burnt Tx Hash already exists");
        burntTxHashes[burntTxHash] = true;
        bytes memory depositData = abi.encodePacked(amount);
        token.deposit(user, depositData);
        emit Deposited(user, amount, burntTxHash);
    }

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
        require(isAdmin(_msgSender()), "Caller does not have Admin Access");
        _;
    }

    /**
     * This is used instead of msg.sender
     */
    function _msgSender() internal view override returns (address payable) {
        return ContextMixin.msgSender();
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
