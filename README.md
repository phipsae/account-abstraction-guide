# Guide to Account Abstraction

This repo should support you in understanding Account Abstraction with ERC4337. Therefor we are using are Simple Account, Account Factory, Paymaster and the EntryPoint contract from the official implementation https://github.com/eth-infinitism/account-abstraction. Everything is build with SE2.

![overview aa tutorial](https://github.com/phipsae/AA-SE2/blob/localChainAA/assets/overview.png)

In this example no bundler is used, therefor Create and Create2 is used. Additionally the Smart Account doesnt have any verification inside the execute function, which means everyone can call it, but for this example it doesnt matter.

The repo tries to break all steps down, so that you get a better understanding whats going on.

The first thing you should do is to look at the smart contracts AccountSimple and AccountFactorySimple itself. To understands whats going on there.

AccountSimple inherits form the example Account of the https://github.com/eth-infinitism/account-abstraction. Therefore it needs to implement the validateUserOp function which is mandatory. It contains the whole validation logic, where you can decide which one you want to use (like Passkeys, Email, etc.) In this case we are going with the “normal” ECDSA key pair validation, but the validation logic is embedded in the smart contract. This is the difference to EOAs where they only can use a standard cryptographic signature scheme (ECDSA for Ethereum) for transaction validation.

Account Factory only has a createAccount function where the Simple Accounts can be created. This factory will be called by the entrypoint contract if a initcode is set.

The paymaster has nothing special. Its just an empty contract which inherits two mandatory functions from the https://github.com/eth-infinitism/account-abstraction

First we deposit funds for the paymaster in the EntryPoint contract, since the entrypoint has to pay for the account creation and tx execution, it needs the respective funds. As a second step we create the userOp, where we hand over the initCode, if the smart account wasnt created yet and the calldata. Addtionally the smart contract address (here called sender), the nonce from the entrypoint (replay protection), the paymaster address and a couple of gas parameter are added.

After that we hash the userOp and sign it. Then we append the signature to the userOp and finally we call handleOps in Entrypoint contract, where it then executes the transaction.

To doublecheck if we increased the count of our smart contract and check to counter (step 6).

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
