// SPDX-License-Identifier: MIT
pragma solidity 0.5.16; //version de truffle par défaut, idealement il faudrait au moins une 0.8.x

contract SupplyChain {
    enum State { Manufactured, Shipped, Delivered }

    struct Product {
        uint id;
        string name;
        State state;
    }

    mapping(uint => Product) public products;
    uint public productCount;

    event ProductUpdated(uint id, string name, State state);

    function createProduct(string memory _name) public {
        productCount++;
        products[productCount] = Product(productCount, _name, State.Manufactured);
        emit ProductUpdated(productCount, _name, State.Manufactured);
    }

    function updateState(uint _productId, State _state) public {
        Product storage product = products[_productId];
        product.state = _state;
        emit ProductUpdated(product.id, product.name, product.state);
    }

    function getProduct(uint _productId) public view returns (uint, string memory, State) {
        Product memory product = products[_productId];
        return (product.id, product.name, product.state);
    }
}
