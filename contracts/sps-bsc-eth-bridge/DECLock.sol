// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import "../utils/NativeMetaTransaction.sol";

contract DECLock is NativeMetaTransaction, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    IERC20 public immutable token;
    event Lock(address indexed user, uint256 amount);
    event Release(address indexed user, uint256 amount);
    event RemoveLiquidity(address indexed triggeredBy, uint256 amount);
    mapping(string => bool) public parentHashesProof;

    constructor(IERC20 _token) public {
        _initializeEIP712("DECLock", "1");
        token = _token;
    }

    function removeLiquidity(uint256 _amount) external onlyOwner nonReentrant {
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
    ) external whenNotPaused onlyOwner nonReentrant {
        require(parentHashesProof[parentHashProof] == false, "Parent Tx Hash already exists");
        parentHashesProof[parentHashProof] = true;
        token.safeTransfer(_user, _amount);
        emit Release(_user, _amount);
    }

    /// Withdraw any IERC20 tokens accumulated in this contract
    function withdrawTokens(IERC20 _token) external onlyOwner nonReentrant {
        require(token != _token, "Cant withdraw the Liquidity Providing tokens");
        _token.safeTransfer(owner(), _token.balanceOf(address(this)));
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
