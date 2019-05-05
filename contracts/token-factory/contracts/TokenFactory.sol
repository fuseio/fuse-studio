pragma solidity ^0.5.2;

import './BasicToken.sol';
import './MintableBurnableToken.sol';

contract TokenFactory {
  enum TokenType {Basic, MintableBurnable}

  event TokenCreated(address indexed token, address indexed issuer, TokenType tokenType);

  function createBasicToken(string memory name, string memory symbol, uint256 initialSupply, string memory tokenURI) public
    returns (address tokenAddress) {
    require(bytes(name).length != 0);
    require(bytes(symbol).length != 0);
    require(initialSupply != 0);

    BasicToken token = new BasicToken(name, symbol, initialSupply, tokenURI);

    token.transfer(msg.sender, initialSupply);
    token.transferOwnership(msg.sender);

    tokenAddress = address(token);
    emit TokenCreated(tokenAddress, msg.sender, TokenType.Basic);
  }

  function createMintableBurnableToken(string memory name, string memory symbol, uint256 initialSupply, string memory tokenURI) public
    returns (address tokenAddress) {
      require(bytes(name).length != 0);
      require(bytes(symbol).length != 0);
      require(initialSupply != 0);

      MintableBurnableToken token = new MintableBurnableToken(name, symbol, initialSupply, tokenURI);

      token.transfer(msg.sender, initialSupply);
      token.transferOwnership(msg.sender);
      token.addMinter(msg.sender);
      token.renounceMinter();

      tokenAddress = address(token);
      emit TokenCreated(tokenAddress, msg.sender, TokenType.MintableBurnable);
    }
}
