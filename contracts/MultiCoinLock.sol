// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./utils/NativeMetaTransaction.sol";

contract MultiCoinLock is NativeMetaTransaction, Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    IERC20 public immutable token;
    event Lock(address indexed user, uint256 amount);
    event Release(address indexed user, uint256 amount);
    event RemoveLiquidity(address indexed triggeredBy, uint256 amount);
    event AdminAccessSet(address _admin, bool _enabled);
    mapping(address => bool) public _admins;
    mapping(string => bool) public parentHashesProof;

    constructor(IERC20 _token) public {
        _initializeEIP712("MultiCoinLock", "1");
        token = _token;
    }

    function removeLiquidity(uint256 _amount) external onlyAdmin nonReentrant {
        token.safeTransfer(owner(), _amount);
        emit RemoveLiquidity(msg.sender, _amount);
    }

    function lockTokens(uint256 _amount) external whenNotPaused nonReentrant {
        token.safeTransferFrom(msg.sender, address(this), _amount);
        emit Lock(msg.sender, _amount);
    }

    function releaseTokens(
        address _user,
        uint256 _amount,
        string memory parentHashProof
    ) external whenNotPaused onlyAdmin nonReentrant {
        require(parentHashesProof[parentHashProof] == false, "Parent Tx Hash already exists");
        parentHashesProof[parentHashProof] = true;
        token.safeTransfer(_user, _amount);
        emit Release(_user, _amount);
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

    /// Withdraw any IERC20 tokens accumulated in this contract
    function withdrawTokens(IERC20 _token) external onlyAdmin nonReentrant {
        require(token != _token, "Cant withdraw the Liquidity Providing tokens");
        _token.safeTransfer(owner(), _token.balanceOf(address(this)));
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
