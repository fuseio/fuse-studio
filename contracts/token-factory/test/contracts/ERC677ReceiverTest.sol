pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/utils/Address.sol";

contract ERC677ReceiverTest {
  address public from;
  uint public value;
  bytes public data;
  uint public someVar = 0;

  function onTokenTransfer(address _from, uint256 _value, bytes calldata _data) external returns(bool) {
    from = _from;
    value = _value;
    data = _data;
    address(this).call(_data);
    return true;
  }

  function doSomething(uint _value) public {
    someVar = _value;
  }
}
