pragma solidity ^0.4.23;

import "cln-solidity/contracts/ColuLocalNetworkSale.sol";
import "cln-solidity/contracts/CurrencyFactory.sol";
import "cln-solidity/contracts/EllipseMarketMaker.sol";
import "cln-solidity/contracts/EllipseMarketMakerLib.sol";
import "cln-solidity/contracts/IssuanceFactory.sol";

contract Migrations {
  address public owner;
  uint public last_completed_migration;

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}
