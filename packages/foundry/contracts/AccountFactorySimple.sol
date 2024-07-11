// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./AccountSimple.sol";

contract AccountFactorySimple {
    function createAccount(address owner) external returns (address) {
        AccountSimple acc = new AccountSimple(owner);
        return address(acc);
    }
}