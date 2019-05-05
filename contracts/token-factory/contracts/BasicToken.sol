pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/drafts/ERC1046/ERC20Metadata.sol";

/**
 * @title BasicToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract BasicToken is ERC20, ERC20Detailed, ERC20Metadata, Ownable {

    event TokenURIChanged(string tokenURI);
    /**
     * @dev Constructor that gives msg.sender all of existing tokens,
     * and making him the owner of the token. The decimals are hard-coded to 18.
     */
    constructor (string memory name, string memory symbol, uint256 initialSupply, string memory tokenURI) public
       ERC20Detailed(name, symbol, 18)
       ERC20Metadata(tokenURI) {
        _mint(msg.sender, initialSupply);
    }
    /// @dev Sets the tokenURI field, can be called by the owner only
    /// @param tokenURI string the URI may point to a JSON file that conforms to the "Metadata JSON Schema".
    function setTokenURI(string memory tokenURI) public onlyOwner {
      _setTokenURI(tokenURI);
      emit TokenURIChanged(tokenURI);
    }
}
