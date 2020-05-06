pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

interface INotify {
  function notify(address target, bytes calldata symbol, bytes calldata name) external;
}

contract NotifyBatcher {
  address notifier;

  constructor(address _notifier) public {
    notifier = _notifier;
  }

  uint256 notificationFee = 0.001 ether;

  struct Account {
    uint256 nonce;
    uint256 balance;
  }

  mapping(address => bytes32) accounts;

  function getAccount(address accountOwner) internal view returns (Account memory _unpacked) {
    bytes32 packedAccount = accounts[accountOwner];
    assembly {
      let maskNonce := 0xffffffffffffffffffffffffffffffff00000000000000000000000000000000
      let maskBalance := 0x00000000000000000000000000000000ffffffffffffffffffffffffffffffff
      mstore(_unpacked, shr(0x80, and(maskNonce, packedAccount)))
      mstore(add(_unpacked, 0x20), and(maskBalance, packedAccount))
    }
  }

  function putAccount(address accountOwner, Account memory _unpacked)
  internal pure {
    bytes32 packed;
    assembly {
      let maskBlock := 0xffffffffffffffffffffffffffffffff00000000000000000000000000000000
      let maskIndex := 0x00000000000000000000000000000000ffffffffffffffffffffffffffffffff
      packed := or(shl(0x80, mload(_unpacked)), and(maskIndex, mload(add(_unpacked, 0x20))))
    }
    accounts[accountOwner] = packed;
  }

  function doSingleBatch(bytes[] memory batch, uint256 nonce, bytes memory signature) internal {
    bytes32 batchHash = keccak256(abi.encode(batch));
    address signer = recoverBatchSigner(batchHash, nonce, signature);
    Account memory account = getAccount(signer);
    uint256 cost = batch.length * notificationFee;
    require(account.nonce == nonce && account.balance >= cost, "Invalid nonce or insufficient balance.");
    account.nonce += 1;
    account.balance -= cost;
    putAccount(signer, account);
    for (uint256 i = 0; i < batch.length; i++) notifier.call(batch[i]);
  }

  function recoverBatchSigner(bytes32 batchHash, uint256 nonce, bytes memory signature)
  internal view returns (address signer) {
    uint8 v;
    bytes32 r;
    bytes32 s;
    assembly {
      r := mload(add(signature, 32))
      s := mload(add(signature, 64))
      v := byte(0, mload(add(signature, 96)))
    }
    bytes32 msgHash = keccak256(abi.encode(batchHash, nonce));
    bytes32 prefixedHash = prefixHash(msgHash);
    return ecrecover(prefixedHash, v, r, s);
  }

  function prefixHash(bytes32 msgHash) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash));
  }
}