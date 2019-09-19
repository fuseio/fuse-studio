pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/utils/Address.sol";

contract ERC677 is ERC20 {
    event Transfer(address indexed from, address indexed to, uint value, bytes data);

    function transferAndCall(address _to, uint _value, bytes calldata _data) external returns (bool) {
      require(_to != address(this));

      _transfer(msg.sender, _to, _value);

      emit Transfer(msg.sender, _to, _value, _data);

      if (Address.isContract(_to)) {
        require(contractFallback(_to, _value, _data));
      }
      return true;
    }

    function contractFallback(address _to, uint _value, bytes memory _data) private returns(bool) {
      (bool success, bytes memory data) = _to.call(abi.encodeWithSignature("onTokenTransfer(address,uint256,bytes)", msg.sender, _value, _data));
      return success;
    }
}
