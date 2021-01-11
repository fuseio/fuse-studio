pragma solidity ^0.6;

// SPDX-License-Identifier: UNLICENSED

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

// Exchange liquidity token

contract ExchangeERC20 is ERC20, ERC20Burnable {

  constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) public {}

}
