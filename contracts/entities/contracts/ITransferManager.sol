pragma solidity ^0.4.24;

/**
 * @title Interface to be implemented by all Transfer Manager modules
 * @dev abstract contract
 */

 
contract ITransferManager {
    function verifyTransfer(address _from, address _to, uint256 _amount) public view returns(bool);
}