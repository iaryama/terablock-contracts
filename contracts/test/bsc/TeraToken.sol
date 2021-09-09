// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../utils/AccessProtected.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// Tera Block Token
contract TeraBlockToken is ERC20("TeraBlock Token", "TBC"), AccessProtected, Pausable {
    address public depositAdmin;

    constructor(address _depositAdmin) public {
        depositAdmin = _depositAdmin;
    }

    function mint(address to, uint256 amount) external onlyAdmin whenNotPaused {
        _mint(to, amount);
    }

    function withdraw(uint256 _amount) external whenNotPaused {
        _burn(_msgSender(), _amount);
    }

    function deposit(address user, bytes calldata depositData) external whenNotPaused {
        require(_msgSender() == depositAdmin, "sender != depositAdmin");
        uint256 amount = abi.decode(depositData, (uint256));
        _mint(user, amount);
    }

    function setDepositAdmin(address _newDepositAdmin) external onlyAdmin whenNotPaused {
        depositAdmin = _newDepositAdmin;
    }

    /// Withdraw any IERC20 tokens accumulated in this contract
    function withdrawTokens(IERC20 _token) external onlyOwner {
        _token.transfer(owner(), _token.balanceOf(address(this)));
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
