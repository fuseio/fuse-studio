pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Entities.sol";

contract EntitiesList is Ownable {
    using Entities for Entities.Entity;

    event EntityAdded(address indexed account, bytes32 roles);
    event EntityRemoved(address indexed account);
    event EntityRolesUpdated(address indexed account, bytes32 roles);

    Entities.Entity private _entities;

    function rolesOf(address _account) public view returns (bytes32) {
        return _entities.rolesOf(_account);
    }

    function addEntity(address _account, bytes32 _roles) onlyOwner public {
        _entities.add(_account, _roles);
        emit EntityAdded(_account, _roles);
    }

    function removeEntity(address _account) onlyOwner public {
        _entities.remove(_account);

        emit EntityRemoved(_account);
    }

    function addRoles(address _account, bytes32 _roles) onlyOwner public {
        bytes32 roles = _entities.addRoles(_account, _roles);
        emit EntityRolesUpdated(_account, roles);
    }

    function removeRoles(address _account, bytes32 _roles) onlyOwner public {
        bytes32 roles = _entities.removeRoles(_account, _roles);

        emit EntityRolesUpdated(_account, roles);
    }

    function hasRoles(address _account, bytes32 _roles) public view returns (bool) {
      return _entities.hasRoles(_account, _roles);
    }
}