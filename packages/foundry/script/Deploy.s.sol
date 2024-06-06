// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../contracts/Account123.sol";
import "../contracts/Account123Factory.sol";
import "/Users/philip/Programming/AABuild/PWAA/node_modules/@account-abstraction/contracts/core/EntryPoint.sol";
import "./DeployHelpers.s.sol";

contract DeployScript is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);

    function run() external {
        // Retrieve deployer's private key
        uint256 deployerPrivateKey = setupLocalhostEnv();
        
        // Check if private key is set
        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
            );
        }
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Account
        Account123 yourAccount = new Account123(vm.addr(deployerPrivateKey));   

        EntryPoint entryPoint = new EntryPoint(); 

        Account123Factory accountFactory = new Account123Factory();
        
        // Log deployment addresses
        console.logString(
            string.concat(
                "YourAccount deployed at: ", vm.toString(address(yourAccount)),
                 "EntryPoint deployed at: ", vm.toString(address(entryPoint)),
                 "AccountFactory deployed at: ", vm.toString(address(accountFactory))
            )
        );
        
        // Stop broadcasting transactions
        vm.stopBroadcast();

        // Export contract deployments
        exportDeployments();
    }

    function test() public {}
}
