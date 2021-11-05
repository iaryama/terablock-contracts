//SPDX-License-Identifier: Unlicense
pragma solidity 0.6.12;

import "./EIP712Base.sol";
import "./ContextMixin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * https://github.com/maticnetwork/pos-portal/blob/master/contracts/common/NativeMetaTransaction.sol
 */
contract NativeMetaTransaction is EIP712Base, ContextMixin, Pausable, Ownable {
    bytes32 private constant META_TRANSACTION_TYPEHASH =
        keccak256(bytes("MetaTransaction(uint256 nonce,address from,bytes functionSignature)"));
    event MetaTransactionExecuted(
        address adminAddress,
        address relayerAddress,
        bytes functionSignature,
        bytes returnData
    );
    event AdminAccessSet(address _admin, bool _enabled);
    mapping(address => uint256) nonces;
    mapping(address => bool) public _admins; // user address => admin? mapping

    /*
     * Meta transaction structure.
     * No point of including value field here as if user is doing value transfer then he has the funds to pay for gas
     * He should call the desired function directly in that case.
     */
    struct MetaTransaction {
        uint256 nonce;
        address from;
        bytes functionSignature;
    }

    function executeMetaTransaction(
        address adminAddress,
        bytes memory functionSignature,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) public returns (bytes memory) {
        require(isAdmin(adminAddress), "The first parameter passed to function is not an Admin Address");
        MetaTransaction memory metaTx = MetaTransaction({
            nonce: nonces[_msgSender()],
            from: _msgSender(),
            functionSignature: functionSignature
        });
        require(verify(adminAddress, metaTx, sigR, sigS, sigV), "Signer and signature do not match");

        // increase nonce for user (to avoid re-use)
        nonces[_msgSender()] = nonces[_msgSender()] + 1;

        // Append adminAddress and relayer address at the end to extract it from calling context
        (bool success, bytes memory returnData) = address(this).call(abi.encodePacked(functionSignature, adminAddress));
        string memory response = string(returnData);
        require(success, response);
        emit MetaTransactionExecuted(adminAddress, _msgSender(), functionSignature, returnData);
        return returnData;
    }

    function hashMetaTransaction(MetaTransaction memory metaTx) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(META_TRANSACTION_TYPEHASH, metaTx.nonce, metaTx.from, keccak256(metaTx.functionSignature))
            );
    }

    function getNonce(address user) public view returns (uint256 nonce) {
        nonce = nonces[user];
    }

    function verify(
        address signer,
        MetaTransaction memory metaTx,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) internal view returns (bool) {
        require(signer != address(0), "NativeMetaTransaction: INVALID_SIGNER");
        return signer == ecrecover(toTypedMessageHash(hashMetaTransaction(metaTx)), sigV, sigR, sigS);
    }

    /**
     * @notice Set Admin Access
     *
     * @param admin - Address of Minter
     * @param enabled - Enable/Disable Admin Access
     */
    function setAdmin(address admin, bool enabled) external onlyOwner {
        _admins[admin] = enabled;
        emit AdminAccessSet(admin, enabled);
    }

    /**
     * @notice Check Admin Access
     *
     * @param admin - Address of Admin
     * @return whether minter has access
     */
    function isAdmin(address admin) public view returns (bool) {
        return owner() == admin || _admins[admin];
    }

    /**
     * Throws if called by any account other than the Admin.
     */
    modifier onlyAdmin(address user) {
        require(tx.origin == user || isAdmin(tx.origin), "Caller != User or Caller != Admin");
        require(_admins[_msgSender()] || _msgSender() == owner(), "Caller does not have Admin Access");
        _;
    }

    /**
     * This is used instead of _msgSender()
     */
    function _msgSender() internal view override returns (address payable) {
        return ContextMixin.msgSender();
    }
}
