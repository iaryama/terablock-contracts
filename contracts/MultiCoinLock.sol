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
    uint256 totalLiquidity;
    uint256 liquidityByAdmin;
    event Lock(address indexed _user, uint256 _amount);
    event Release(address indexed user, uint256 amount);
    event AddLiquidity(address indexed _admin, uint256 _amount);

    constructor(IERC20 _token) public {
        token = _token;
    }

    function addLiquidity(uint256 _amount) external nonReentrant {
        require(msg.sender == liquidityAdmin, "Sender != LiquidityAdmin");
        totalLiquidity = totalLiquidity.add(_amount);
        liquidityByAdmin = liquidityByAdmin.add(_amount);
        token.safeTransferFrom(msg.sender, address(this), _amount);
        emit AddLiquidity(msg.sender, _amount);
    }

    function lockTokens(uint256 _amount) external nonReentrant {
        totalLiquidity = totalLiquidity.add(_amount);
        token.safeTransferFrom(msg.sender, address(this), _amount);
        emit Lock(msg.sender, _amount);
    }

    function releaseTokens(address _user, uint256 _amount) external onlyAdmin(_user) nonReentrant {
        token.safeTransfer(_user, _amount);
        emit Release(_user, _amount);
    }

    function setLiquidityAdmin(address _liquidityAdmin) external onlyOwner {
        liquidityAdmin = _liquidityAdmin;
    }
}
