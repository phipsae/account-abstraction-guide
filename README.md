# 👩‍🏫 Guide to Account Abstraction

This repository is designed to help you understand Account Abstraction using ERC4337. We utilize the Simple Account, Account Factory, Paymaster, and EntryPoint contract from the official implementation available at https://github.com/eth-infinitism/account-abstraction. Everything is built with SE2.

![overview aa guide](https://github.com/phipsae/account-abstraction-guide/blob/main/assets/overview.png)

When a user submits a user operation to the EntryPoint contract, it checks if the smart account is already created. If not, it calls the account factory to create an account. Then, the call data is used to execute the transaction. The EntryPoint also ensures that it is reimbursed for the gas costs, so it needs to be funded upfront by the party paying for the transaction. In our example, we use a basic implementation of a paymaster, which covers all costs. If the validation is successful, the EntryPoint interacts with the mainnet to complete the transaction.

In this example, no bundler is used. We pass the user operation directly to the EntryPoint. A bundler collects multiple user operations and submits them as a bundle to the EntryPoint contract. The EntryPoint contract validates, executes, and processes these operations, ensuring efficient and secure transaction handling on the Ethereum network. One advantage of using a bundler is improved gas efficiency.

Start by examining the AccountSimple and AccountFactorySimple smart contracts to understand their functions. And then have a look into the EntryPoint contract, especially the handleOps function.

The repository breaks down each step to help you gain a better understanding of the process. Eventually, we can verify if we have incremented the count in our smart contract and check the counter (step 6).

This repository is a work in progress. If further clarification is needed, let me know and I will provide it. As a primary resource, I used the videos from Alchemy for Account, which were very helpful and highly recommended.

## 👩‍💻 Contracts

### AccountSimple.sol

AccountSimple inherits from the example Account in the https://github.com/eth-infinitism/account-abstraction repository by the Ethereum Foundation. As a result, it must implement the mandatory validateUserOp function. This function contains the entire validation logic, allowing you to choose the desired method (such as Passkeys, Email, etc.). In this example, we use the standard ECDSA key pair validation as used with EOAs on Ethereum. The difference is that the validation logic is embedded within the smart contract.

It's important to note that there is no verification required to call the execute function, meaning anyone can call it. A potential check could be to verify that the EntryPoint (having Entrypoint as a state variable in Account) is the msg.sender.

### AccountFactorySimple.sol

The Account Factory contains only a createAccount function, which is used to create Simple Accounts. This factory is called by the EntryPoint contract if an initcode is set.

To determine the smart account address, we use the Create method instead of Create2. This involves using a factory nonce that we specify inside our next.js project. Changing the factory nonce will result in a different smart account address for a given EOA. However, for scenarios involving a bundler, Create2 must be used since Create is a forbidden opcode.

### Paymaster.sol

The paymaster is a simple contract without any special features. It inherits two mandatory functions from the https://github.com/eth-infinitism/account-abstraction repository.

We have to deposit funds for the paymaster in the EntryPoint contract (using its depositTo function). Since the entrypoint has to pay for the account creation and tx execution, it needs to make sure it has the respective funds.

### EntryPoint.sol

We use the EntryPoint from the https://github.com/eth-infinitism/account-abstraction repository. After we create the singed userOps with initCode and callData we hand it over to the EntryPoint, via calling the handleOps function.

# 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Foundry, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
cd my-dapp-example
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Foundry. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `packages/foundry/foundry.toml`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/foundry/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/foundry/script` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn foundry:test`

- Edit your smart contract `YourContract.sol` in `packages/foundry/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit your deployment scripts in `packages/foundry/script`

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.
