// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import "./utils/NativeMetaTransaction.sol";

contract MultiCoinLock is NativeMetaTransaction, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    IERC20 public immutable token;
    address public liquidityAdmin;
    event Lock(address indexed user, uint256 amount);
    event Release(address indexed user, uint256 amount);
    event AddLiquidity(address indexed admin, uint256 amount);
    event RemoveLiquidity(address indexed admin, uint256 amount);
    event AddedLiquidityAdmin(address indexed admin);
    event AdminAccessSet(address _admin, bool _enabled);
    mapping(address => bool) public _admins;
    mapping(string => bool) public parentHashesProof;

    constructor(IERC20 _token) public {
        _initializeEIP712("MultiCoinLock", "1");
        token = _token;
    }

    function addLiquidity(uint256 _amount) external onlyLiquidityAdmin nonReentrant {
        token.safeTransferFrom(msg.sender, address(this), _amount);
        emit AddLiquidity(msg.sender, _amount);
    }

    function removeLiquidity(uint256 _amount) external onlyLiquidityAdmin nonReentrant {
        token.safeTransfer(msg.sender, _amount);
        emit RemoveLiquidity(msg.sender, _amount);
    }

    function lockTokens(uint256 _amount) external nonReentrant {
        token.safeTransferFrom(msg.sender, address(this), _amount);
        emit Lock(msg.sender, _amount);
    }

    function releaseTokens(
        address _user,
        uint256 _amount,
        string memory parentHashProof
    ) external onlyAdmin nonReentrant {
        require(parentHashesProof[parentHashProof] == false, "Parent Tx Hash already exists");
        parentHashesProof[parentHashProof] = true;
        token.safeTransfer(_user, _amount);
        emit Release(_user, _amount);
    }

    function setLiquidityAdmin(address _liquidityAdmin) external onlyOwner {
        liquidityAdmin = _liquidityAdmin;
        emit AddedLiquidityAdmin(_liquidityAdmin);
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
     * Throws if called by any account other than the Liquidity Admin.
     */
    modifier onlyLiquidityAdmin() {
        require(msg.sender == liquidityAdmin, "Sender != LiquidityAdmin");
        _;
    }

    /**
     * This is used instead of msg.sender
     */
    function _msgSender() internal view override returns (address payable) {
        return ContextMixin.msgSender();
    }
}
