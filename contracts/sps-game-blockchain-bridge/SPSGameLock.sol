//SPDX-License-Identifier: Unlicense
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import {SafeERC20, SafeMath} from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {AccessProtected} from "../utils/AccessProtected.sol";

contract SPSGameLock is ReentrancyGuard, AccessProtected, Pausable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    uint256 public minAmount = 200 ether;

    struct Transaction {
        address user;
        uint256 amount;
        string username;
        string txId;
        bool processed;
    }

    // txId => transaction
    mapping(string => Transaction) public txMap;
    // username => index => txs
    mapping(string => mapping(uint256 => Transaction)) public playerTxByIndexMap;
    // to get the count. so loop over the count to hit `playerTxByIndexMap` to get Txs
    mapping(string => uint256) public playerTxCount;

    Transaction[] public txs;

    event Lock(address indexed user, uint256 amount, string username);
    event Release(address indexed user, uint256 amount, string username, string txId);
    event RemoveLiquidity(address indexed triggeredBy, uint256 amount);
    event Commission(address indexed receiver, uint256 amount);

    constructor(IERC20 _token) public {
        token = _token;
    }

    function removeLiquidity(uint256 _amount) public onlyAdmin nonReentrant {
        token.safeTransfer(owner(), _amount);
        emit RemoveLiquidity(msg.sender, _amount);
    }

    function lockTokens(uint256 _amount, string memory _username) public whenNotPaused nonReentrant {
        token.safeTransferFrom(msg.sender, address(this), _amount);
        emit Lock(msg.sender, _amount, _username);
    }

    function releaseTokensBatch(
        address[] memory _users,
        uint256[] memory _amounts,
        string[] memory _usernames,
        string[] memory _txIds
    ) public whenNotPaused onlyAdmin nonReentrant {
        uint256 len = _users.length;
        require(_amounts.length == len && _usernames.length == len && _txIds.length == len, "length mismatch");
        for (uint256 i = 0; i < len; i++) {
            _releaseTokens(_users[i], _amounts[i], _usernames[i], _txIds[i]);
        }
    }

    function settleCommission(address _receiver, uint256 _amount) public onlyAdmin {
        token.safeTransfer(_receiver, _amount);
        emit Commission(_receiver, _amount);
    }

    /// Withdraw any IERC20 tokens stuck in this contract
    function withdrawTokens(IERC20 _token) public onlyOwner nonReentrant {
        require(token != _token, "Cant withdraw the Liquidity Providing tokens");
        _token.safeTransfer(owner(), _token.balanceOf(address(this)));
    }

    function setMinAmount(uint256 _amount) public onlyAdmin {
        minAmount = _amount;
    }

    function getBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _releaseTokens(
        address _user,
        uint256 _amount,
        string memory _username,
        string memory _txId
    ) internal {
        require(!txMap[_txId].processed, "transaction id already processed");
        require(_amount >= minAmount, "amount < minAmount");
        Transaction memory transaction = Transaction({
            user: _user,
            amount: _amount,
            username: _username,
            txId: _txId,
            processed: true
        });
        txs.push(transaction);
        txMap[_txId] = transaction;
        uint256 index = playerTxCount[_username];
        playerTxByIndexMap[_username][index] = transaction;
        playerTxCount[_username] = index.add(1);
        token.safeTransfer(_user, _amount);
        emit Release(_user, _amount, _username, _txId);
    }
}
