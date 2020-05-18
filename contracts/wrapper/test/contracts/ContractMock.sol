pragma solidity 0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

/**
* @title mock contract
* @author LiorRabin
*/
contract ContractMock {

  function method(address _token, address _to, uint256 _value) external returns(bool) {
    require(IERC20(_token).transferFrom(msg.sender, address(this), _value), "method/in");
    require(IERC20(_token).transfer(_to, _value), "method/transfer");
    return true;
  }
}