//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Swap {
    IERC20 public oldToken;
    IERC20 public newToken;
    address private owner;

    constructor(IERC20 _oldToken, IERC20 _newToken) {
        require(
            _oldToken != _newToken && address(_oldToken) != address(0) && address(_newToken) != address(0),
            "wrong token addresses"
        );
        oldToken = _oldToken;
        newToken = _newToken;
        owner = msg.sender;
    }

    /// Swap `oldToken` with `newToken`
    /// @notice Approve before call
    function swapTokens(uint256 _amount) external {
        require(oldToken.transferFrom(msg.sender, address(this), _amount), "transferFrom of old tokens failed");
        require(newToken.transfer(msg.sender, _amount), "transfer of new tokens failed");
    }

    /// Withdraw old tokens accumulated in this contract
    function withdrawTokens() external {
        require(msg.sender == owner, "only owner");
        oldToken.transfer(owner, oldToken.balanceOf(address(this)));
    }
}
