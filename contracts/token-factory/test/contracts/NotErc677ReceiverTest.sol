pragma solidity ^0.5.2;

contract NotERC677ReceiverTest {
  address public from;
  uint public value;
  bytes public data;
  uint public someVar = 0;

  function doSomething(uint _value) public {
    someVar = _value;
  }
}
