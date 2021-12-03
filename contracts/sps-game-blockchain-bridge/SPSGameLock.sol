//SPDX-License-Identifier: Unlicense
pragma solidity 0.6.12;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SPSGameLock is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    mapping(address => bool) public admins;

    event Lock(address indexed user, uint256 amount);
    event Release(address indexed user, uint256 amount);
    event RemoveLiquidity(address indexed triggeredBy, uint256 amount);
    event AdminAccessSet(address _admin, bool _enabled);

    constructor(IERC20 _token) public {
        token = _token;
    }

    modifier onlyAdmin() {
        require(admins[_msgSender()] || _msgSender() == owner(), "Caller does not have Admin Access");
        _;
    }

    function setAdmin(address admin, bool enabled) external onlyOwner {
        admins[admin] = enabled;
        emit AdminAccessSet(admin, enabled);
    }

    function removeLiquidity(uint256 _amount) external onlyAdmin nonReentrant {
        token.safeTransfer(owner(), _amount);
        emit RemoveLiquidity(msg.sender, _amount);
    }

    function lockTokens(uint256 _amount) external whenNotPaused nonReentrant {
        token.safeTransferFrom(msg.sender, address(this), _amount);
        emit Lock(msg.sender, _amount);
    }

    function releaseTokens(address _user, uint256 _amount) external whenNotPaused onlyAdmin nonReentrant {
        token.safeTransfer(_user, _amount);
        emit Release(_user, _amount);
    }

    /// Withdraw any IERC20 tokens accumulated in this contract
    function withdrawTokens(IERC20 _token) external onlyOwner nonReentrant {
        require(token != _token, "Cant withdraw the Liquidity Providing tokens");
        _token.safeTransfer(owner(), _token.balanceOf(address(this)));
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
