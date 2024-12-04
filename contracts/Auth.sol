// SPDX-License-Identifier: MIT
pragma solidity 0.5.16; //version de truffle par défaut, idealement il faudrait au moins une 0.8.x

contract Auth {
    struct User {
        address userAddress;
        string username;
        bool registered;
    }

    mapping(address => User) private users;

    event UserRegistered(address indexed userAddress, string username);
    event UserAuthenticated(address indexed userAddress);

    // Enregistrement d'un utilisateur
    function register(string calldata _username) external {
        require(!users[msg.sender].registered, "User already registered");
        users[msg.sender] = User(msg.sender, _username, true);
        emit UserRegistered(msg.sender, _username);
    }

    // Authentification d'un utilisateur existant
    function authenticate() external view returns (string memory) {
        require(users[msg.sender].registered, "User not registered");
        return users[msg.sender].username;
    }
}