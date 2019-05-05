pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

import "./BasicToken.sol";

contract MintableBurnableToken is BasicToken, ERC20Burnable, ERC20Mintable {
  constructor (string memory name, string memory symbol, uint256 initialSupply, string memory tokenURI) public
     BasicToken(name, symbol, initialSupply, tokenURI) {
  }
}
