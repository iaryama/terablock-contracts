//SPDX-License-Identifier: Unlicense
pragma solidity 0.6.12;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MultiCoinBridge is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    address public admin;

    event AdminChange(address indexed oldAdmin, address indexed newAdmin);
    event Lock(address indexed user, uint256 amount);
    event Release(address indexed user, uint256 amount);

    constructor(IERC20 _token) public {
        token = _token;
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "!admin");
        _;
    }

    function lockTokens(uint256 _amount) external nonReentrant {
        token.safeTransferFrom(msg.sender, address(this), _amount);
        emit Lock(msg.sender, _amount);
    }

    function releaseTokens(address _user, uint256 _amount) external onlyAdmin nonReentrant {
        token.safeTransfer(_user, _amount);
        emit Release(_user, _amount);
    }

    function setAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "address(0) not allowed");
        address oldAdmin = admin;
        admin = _newAdmin;
        emit AdminChange(oldAdmin, _newAdmin);
    }
}
