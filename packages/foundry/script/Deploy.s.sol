// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../contracts/Account123.sol";
import "../contracts/Account123Factory.sol";
import "../contracts/AccountSimple.sol";
import "../contracts/Paymaster.sol";
import "../contracts/Test.sol";
import "/Users/philip/Programming/Ethereum/AABuild/PWAA/node_modules/@account-abstraction/contracts/core/EntryPoint.sol";
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

        // /// Deploy EntryPoint contract -- 0x5FbDB2315678afecb367f032d93F642f64180aa3
        // EntryPoint entryPoint = new EntryPoint(); 


        /// Deploy Account
        Account123 yourAccount = new Account123(vm.addr(deployerPrivateKey));   

        /// Deploy Simple Account Factory --- 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
        AccountSimpleFactory accountSimpleFactory= new AccountSimpleFactory();


        Account123Factory accountFactory = new Account123Factory();

        // Paymaster paymaster = new Paymaster();
        
        // Log deployment addresses
        console.logString(
            string.concat(
                //  "EntryPoint deployed at: ", vm.toString(address(entryPoint))
                // "YourAccount deployed at: ", vm.toString(address(yourAccount)),
                //  "AccountFactory deployed at: ", vm.toString(address(accountFactory)),
                 "AccountSimpleFactory deployed at: ", vm.toString(address(accountSimpleFactory))
                //  "Paymaster deployed at: ", vm.toString(address(paymaster))                   
            )
        );
        
        // Stop broadcasting transactions
        vm.stopBroadcast();

        // Export contract deployments
        exportDeployments();
    }

    function test() public {}
}
