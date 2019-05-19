pragma solidity ^0.4.24;

library Entities {
    struct Entity {
        mapping (address => bytes32) bearer;
    }

    function add(Entity storage entity, address _account, bytes32 _roles) internal {
        require(!has(entity, _account));
        entity.bearer[_account] = _roles;
    }

    function update(Entity storage entity, address _account, bytes32 _roles) internal {
        require(has(entity, _account));
        entity.bearer[_account] = entity.bearer[_account] | _roles;
    }

    function remove(Entity storage entity, address _account) internal {
        require(has(entity, _account));
        delete entity.bearer[_account];
    }

    function addRoles(Entity storage entity, address _account, bytes32 _roles) internal returns (bytes32) {
        require(has(entity, _account));
        entity.bearer[_account] = entity.bearer[_account] | _roles;
        return entity.bearer[_account];
    }

    function removeRoles(Entity storage entity, address _account, bytes32 _roles) internal returns (bytes32) {
        require(has(entity, _account));
        entity.bearer[_account] = entity.bearer[_account] & ~_roles;
        return entity.bearer[_account];
    }

    function has(Entity storage entity, address account) internal view returns (bool) {
        require(account != address(0));
        return entity.bearer[account] != bytes32(0);
    }

    function hasRoles(Entity storage entity, address _account, bytes32 _roles) internal view returns (bool) {
        require(_account != address(0));
        return (entity.bearer[_account] & _roles) == _roles;
    }

    function rolesOf(Entity storage entity, address _account) internal view returns (bytes32) {
        return entity.bearer[_account];
    }
}