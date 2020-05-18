pragma solidity 0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

/**
* @title ERC20 mock contract
* @author LiorRabin
*/
contract ERC20Mock is ERC20, ERC20Detailed, ERC20Mintable, ERC20Burnable {
  constructor () public
    ERC20Detailed('ERC20 Mock', 'MCK', 18) { }
}