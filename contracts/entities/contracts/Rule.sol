pragma solidity ^0.4.24;

contract Rule { 
  bytes32 public fromMask;
  bytes32 public toMask;
  bool public isMax;
  uint256 public amount;

  constructor (bytes32 _fromMask, bytes32 _toMask, bool _isMax, uint256 _amount) public {
    fromMask = _fromMask;
    toMask = _toMask;
    isMax = _isMax;
    amount = _amount;
  }

  function verify (bytes32 _from, bytes32 _to, uint256 _amount) public view returns (bool) {
    if ((fromMask == bytes32(0) || (fromMask & _from) != bytes32(0)) &&
      (toMask == bytes32(0) || (toMask & _to) != bytes32(0))) {
        if (isMax) {
          return amount >= _amount;
        } else {
          return amount <= _amount;
        }
    }
    return false;
  }
}