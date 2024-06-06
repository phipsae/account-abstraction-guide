// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "/Users/philip/Programming/AABuild/PWAA/node_modules/@account-abstraction/contracts/core/EntryPoint.sol";
import "/Users/philip/Programming/AABuild/PWAA/node_modules/@account-abstraction/contracts/interfaces/IAccount.sol";

contract Account123 is IAccount {

    uint public count;
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function validateUserOp(UserOperation calldata , bytes32 , uint256 ) pure external returns (uint256 validationData) {
        return 0;
    }

    function execute() external {
        count++;
    }
  

 
}

// contract Account123Factory {
//     function createAccount(address owner) external returns (address) {
//         Account123 account = new Account123(owner);
//         return address(account);
//     }
// }