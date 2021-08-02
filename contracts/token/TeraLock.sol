// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
import "../test/TeraToken.sol";
import "../utils/AccessProtected.sol";

// Tera Lock
contract TeraLock is AccessProtected {
    TeraToken private _teraToken;
    struct Tokens {
        bool isLocked;
        uint256 tokensLocked;
        uint256 currentTokensToBeReleasedOntoPolygon;
        uint256 tokensReleased;
    }
    mapping(address => Tokens) private tokens;
    event TokenLocked(address _userAddress, uint256 _tokensLocked, uint256 _currentTokensToBeReleasedOntoPolygon);
    event TokenReleased(address _userAddress, uint256 _tokensReleased, uint256 _currentReleasedTokens);

    constructor(TeraToken teraToken) public {
        _teraToken = teraToken;
    }

    function lockTokens(uint256 amount) external returns (bool _isSuccess) {
        require(tokens[msg.sender].isLocked == false, "The user already has tokens locked");
        require(
            _teraToken.allowance(msg.sender, address(this)) == amount,
            "Tokens to be locked should equal the allowance given by the user"
        );
        _teraToken.transferFrom(msg.sender, address(this), amount);
        tokens[msg.sender].tokensLocked += amount;
        tokens[msg.sender].currentTokensToBeReleasedOntoPolygon = amount;
        tokens[msg.sender].isLocked = true;
        uint256 tokensLocked = tokens[msg.sender].tokensLocked;
        emit TokenLocked(msg.sender, tokensLocked, amount);
        return true;
    }

    function releaseTokens(address userAddress) external onlyAdmin returns (bool _isSuccess) {
        require(tokens[userAddress].isLocked == true, "Tokens are not locked to be released");
        tokens[userAddress].tokensReleased += tokens[userAddress].currentTokensToBeReleasedOntoPolygon;
        uint256 currentTokensReleased = tokens[userAddress].currentTokensToBeReleasedOntoPolygon;
        tokens[userAddress].currentTokensToBeReleasedOntoPolygon = 0;
        tokens[userAddress].isLocked = false;
        uint256 tokensReleased = tokens[userAddress].tokensReleased;
        emit TokenReleased(userAddress, tokensReleased, currentTokensReleased);
        return true;
    }

    function releaseTokensToBSC(address userAddress, uint256 amount) external onlyAdmin returns (bool _isSuccess) {
        require(amount != 0, "Cant Release 0 tokens onto BSC");
        _teraToken.transfer(userAddress, amount);
        return true;
    }

    function getCurrentState(address userAddress)
        external
        view
        onlyAdmin
        returns (
            uint256 _tokensLocked,
            uint256 _tokensReleased,
            uint256 _currentTokensToBeReleasedOntoPolygon,
            bool _isLocked
        )
    {
        return (
            tokens[userAddress].tokensLocked,
            tokens[userAddress].tokensReleased,
            tokens[userAddress].currentTokensToBeReleasedOntoPolygon,
            tokens[userAddress].isLocked
        );
    }
}
