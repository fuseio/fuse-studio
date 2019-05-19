pragma solidity ^0.4.24;

import "./EntitiesList.sol";

contract Community {
    EntitiesList public entitiesList;
    
    bytes32 public constant userMask = bytes32(1);
    bytes32 public constant adminMask = bytes32(2);
    
    constructor () public {
        entitiesList = new EntitiesList();
        entitiesList.addEntity(msg.sender, userMask | adminMask);
    }

    function setEntitiesList(address _entitiesList) public onlyAdmin {
        entitiesList = EntitiesList(_entitiesList);
    }

    modifier onlyAdmin () {
        require(entitiesList.hasRoles(msg.sender, adminMask));
        _;
    }

    function join() public {
        entitiesList.addEntity(msg.sender, userMask);
    }

    function addEntity(address _account, bytes32 _roles) public onlyAdmin {
        entitiesList.addEntity(_account, _roles);
    }

    function removeEntity(address _account) onlyAdmin public {
        entitiesList.removeEntity(_account);
    }

    function addEnitityRoles(address _account, bytes32 _entityRoles) public onlyAdmin {
        entitiesList.addRoles(_account, _entityRoles);
    }

    function removeEnitityRoles(address _account, bytes32 _entityRoles) public onlyAdmin {
        entitiesList.removeRoles(_account, _entityRoles);
    }

    function hasRoles(address _account, bytes32 _entityRoles) public view returns (bool) {
        return entitiesList.hasRoles(_account, _entityRoles);
    }
}