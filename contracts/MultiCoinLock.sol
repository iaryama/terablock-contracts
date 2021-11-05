// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./utils/NativeMetaTransaction.sol";

contract MultiCoinLock is NativeMetaTransaction, ReentrancyGuard {
    using SafeERC20 for IERC20;
    IERC20 public immutable token;

    event Lock(address indexed _user, uint256 _amount);
    event Release(address indexed user, uint256 amount);

    constructor(IERC20 _token) {
        token = _token;
    }

    function lockTokens(uint256 _amount) external nonReentrant {
        token.safeTransferFrom(msg.sender, address(this), _amount);
        emit Lock(msg.sender, _amount);
    }

    function releaseTokens(address _user, uint256 _amount) external onlyAdmin(_user) nonReentrant {
        token.safeTransfer(_user, _amount);
        emit Release(_user, _amount);
    }
}
