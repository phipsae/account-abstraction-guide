// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./Account123.sol";


contract Account123Factory {
    function createAccount(address owner) external returns (address) {
        Account123 account = new Account123(owner);
        return address(account);
    }


    // function createAccount(address owner) external returns (address) {
    //     bytes32 salt = bytes32(uint256(uint160(owner)));
    //     bytes memory creationCode = type(Account).creationCode;
    //     bytes memory bytecode = abi.encodePacked(creationCode, abi.encode(owner));

    //     address addr = Create2.computeAddress(salt, keccak256(bytecode));
    //     uint256 codeSize = addr.code.length;
    //     if (codeSize > 0) {
    //         return addr;
    //     }

    //     return deploy(salt, bytecode);
    // }

    // function deploy(bytes32 salt, bytes memory bytecode) internal returns (address addr) {
    //     require(bytecode.length != 0, "Create2: bytecode length is zero");
    //     /// @solidity memory-safe-assembly
    //     assembly {
    //         addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
    //     }
    //     require(addr != address(0), "Create2: Failed on deploy");
    // }
}