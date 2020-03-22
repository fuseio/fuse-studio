pragma solidity ^0.5.2;

import "./MintableBurnableToken.sol";

contract ExpirableToken is MintableBurnableToken {
  uint256 private _expiryTime;

  constructor (string memory name, string memory symbol, uint256 initialSupply, string memory tokenURI, uint256 expiryTime) public
     MintableBurnableToken(name, symbol, initialSupply, tokenURI) {
         _expiryTime = expiryTime;
  }

  function _transfer(address sender, address recipient, uint256 amount) internal {
    require(block.timestamp < _expiryTime, "expiry time has passed");
    super._transfer(sender, recipient, amount);
  }
}
