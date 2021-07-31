//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Swap {
    IERC20 oldToken;
    IERC20 newToken;
    address private owner;

    constructor(IERC20 _oldToken, IERC20 _newToken) {
        require(_oldToken != _newToken && address(_oldToken) != address(0), "wrong token addresses");
        oldToken = _oldToken;
        newToken = _newToken;
        owner = msg.sender;
    }

    /// @dev approve before call
    /// @notice swap `oldToken` for `newToken`
    function swap(uint256 _amount) external {
        require(oldToken.transferFrom(msg.sender, address(this), _amount), "transferFrom of old tokens failed");
        require(newToken.transfer(msg.sender, _amount), "transfer of new tokens failed");
    }

    /// @notice withdraw old tokens accumulated in this contract
    function withdrawTokens() external {
        require(msg.sender == owner, "only owner");
        oldToken.transfer(owner, oldToken.balanceOf(address(this)));
    }
}
