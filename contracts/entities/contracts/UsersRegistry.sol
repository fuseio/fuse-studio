pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract UsersRegistry is Ownable {
    mapping (address => string) public users;

    event UserAdded(address indexed account, string userUri);
    event UserRemoved(address indexed account);
    event UserUpdated(address indexed account, string userUri);

    function addUser(address _account, string _userUri) onlyOwner public {
        require(_account != address(0));
        require(bytes(users[_account]).length == 0);
        users[_account] = _userUri;

        emit UserAdded(_account, _userUri);
    }

    function removeUser(address _account) onlyOwner public {
        require(_account != address(0));
        require(bytes(users[_account]).length > 0);
        delete users[_account];

        emit UserRemoved(_account);
    }

    function updateUser(address _account, string _userUri) onlyOwner public {
        require(_account != address(0));
        require(bytes(users[_account]).length > 0);
        users[_account] = _userUri;

        emit UserUpdated(_account, _userUri);
    }

    function join(string _userUri) public {
        require(bytes(users[msg.sender]).length == 0);
        users[msg.sender] = _userUri;

        emit UserAdded(msg.sender, _userUri);
    }
}