// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// import "/Users/philip/Programming/Ethereum/AABuild/PWAA/node_modules/@account-abstraction/contracts/core/EntryPoint.sol";
import "/Users/philip/Programming/Ethereum/AABuild/PWAA/node_modules/@account-abstraction/contracts/interfaces/IAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol"; 
import "forge-std/console.sol";

contract AccountSimple is IAccount {

    uint public count;
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function validateUserOp(UserOperation calldata userOp, bytes32 , uint256 ) view external returns (uint256 validationData) {
        return 0;
    }

    function execute() external {
        count++;
    }
}

contract AccountSimpleFactory {
    function createAccount(address owner) external returns (address) {
        AccountSimple acc = new AccountSimple(owner);
        return address(acc);
    }
}