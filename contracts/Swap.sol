//SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
    @title Contract for swapping `oldToken` to `newToken`

    @dev Requirements: 

    - contract should hold the `newTokens` to be distributed
 */
contract Swap {
    IERC20 public oldToken;
    IERC20 public newToken;
    address private owner;

    constructor(IERC20 _oldToken, IERC20 _newToken) public {
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
