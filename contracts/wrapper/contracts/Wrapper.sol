pragma solidity 0.5.2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
* @title Wrapper contract
* @author LiorRabin
*/
contract Wrapper is Ownable {
  using SafeMath for uint256;

  function transferWithFee(address _token, address _recipient, uint256 _amount, address _feeRecipient, uint256 _feeAmount) public {
    uint256 totalAmount = _amount.add(_feeAmount);
    require(IERC20(_token).transferFrom(msg.sender, address(this), totalAmount), "transferWithFee/in");
    require(IERC20(_token).transfer(_feeRecipient, _feeAmount), "transferWithFee/fee");
    require(IERC20(_token).transfer(_recipient, _amount), "transferWithFee/transfer");
  }

  function transferAndCallWithFee(address _token, address _recipient, uint256 _amount, address _feeRecipient, uint256 _feeAmount, bytes memory _data) public {
    uint256 totalAmount = _amount.add(_feeAmount);
    require(IERC20(_token).transferFrom(msg.sender, address(this), totalAmount), "transferWithFee/in");
    require(IERC20(_token).transfer(_feeRecipient, _feeAmount), "transferWithFee/fee");
    require(IERC20(_token).approve(_recipient, _amount), "transferWithFee/approve");
    (bool success,) = _recipient.call(_data);
    require (success, "transferWithFee/call");
  }
}