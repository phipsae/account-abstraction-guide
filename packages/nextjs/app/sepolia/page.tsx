"use client";

import { useState } from "react";
import { ethers } from "ethers";
import type { NextPage } from "next";
import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  getContract,
  getContractAddress,
  http,
  parseUnits,
  toBytes,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const FACTORY_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const PM_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

const LocalChain: NextPage = () => {
  let initCode = "0x";
  let createAccountEncoded = "";

  const account1 = privateKeyToAccount(process.env.NEXT_PUBLIC_FOUNDRY_PRIVATE_KEY_1 as `0x${string}`);
  // const account2 = privateKeyToAccount(process.env.NEXT_PUBLIC_FOUNDRY_PRIVATE_KEY_2 as `0x${string}`);

  const [signature, setSignature] = useState<string>("");
  const [userOp, setUserOp] = useState({} as any);

  const { data: entryPoint } = useScaffoldContract({
    contractName: "EntryPoint",
  });

  const { data: accountFactory } = useScaffoldContract({
    contractName: "AccountFactorySepolia",
  });

  const { data: accountSimple } = useScaffoldContract({
    contractName: "AccountSimple",
  });

  const { data: paymaster } = useScaffoldContract({
    contractName: "Paymaster",
  });

  const { writeContractAsync: entryPointWriteFunction } = useScaffoldWriteContract("EntryPoint");

  if (accountFactory) {
    createAccountEncoded = encodeFunctionData({
      abi: accountFactory?.abi,
      functionName: "createAccount",
      args: [account1.address as `0x${string}`],
    });
    initCode = accountFactory?.address + createAccountEncoded.slice(2);
  }

  //   const client = createWalletClient({
  //     account: account1,
  //     chain: foundry,
  //     // mode: "anvil",
  //     transport: http(),
  //   });

  const sender = getContractAddress({
    bytecode: initCode as `0x${string}`,
    from: FACTORY_ADDRESS,
    opcode: "CREATE2",
    salt: toBytes(account1.address as `0x${string}`),
  });

  //   const SMART_ACCOUNT = sender;

  //   let createAccountEncoded = "";

  //   let executeEncoded = "";

  //   if (accountSimple) {
  //     executeEncoded = encodeFunctionData({
  //       abi: accountSimple?.abi,
  //       functionName: "execute",
  //     });
  //   }

  //   /// create userOP without signature -- append sig later after signed UserOp
  //   const createUserOp = async () => {
  //     if (executeEncoded && createAccountEncoded) {
  //       /// if already SA created then use 0x
  //       initCode = accountSimpleFactory?.address + createAccountEncoded.slice(2);

  //       // console.log("InitCode", initCode);

  //       // const callData = "0x";
  //       const callData = executeEncoded;

  //       const userOp = {
  //         sender, // smart account address
  //         nonce: nonceFromEP, // nonce from the entrypoint nonce manager
  //         initCode,
  //         callData,
  //         callGasLimit: 500_000,
  //         verificationGasLimit: 500_000,
  //         preVerificationGas: 50_000,
  //         maxFeePerGas: ethers.parseUnits("10", "gwei"), //parseUnits("10", 9),
  //         maxPriorityFeePerGas: ethers.parseUnits("5", "gwei"),
  //         paymasterAndData: PM_ADDRESS,
  //         signature: "0x",
  //       };
  //       console.log("User Op", userOp);
  //       setUserOp(userOp);
  //     }
  //   };

  //   const [userOpHash, setUserOpHash] = useState<`0x${string}`>();

  //   const createUserOpHash = async () => {
  //     console.log(userOp);
  //     const userOpHash = await entryPoint?.read.getUserOpHash([userOp]);
  //     console.log("User Op Hash", userOpHash);
  //     setUserOpHash(userOpHash);
  //   };

  //   // /// Create Signature viem
  //   const client = createWalletClient({
  //     account: account1,
  //     chain: foundry,
  //     // mode: "anvil",
  //     transport: http(),
  //   });

  //   const createSignature = async () => {
  //     console.log("Signer", account1);
  //     // /// only for messages like "hi" which are not secure
  //     // const message = toBytes(keccak256(toBytes(userOpHash as `0x${string}`)));
  //     /// for userOpHash
  //     const message = toBytes(userOpHash as `0x${string}`);
  //     console.log("Message viem", message);
  //     const signature = await client.signMessage({
  //       // account: account1,
  //       // prettier-ignore
  //       message: {raw: message},
  //     });
  //     console.log(signature);
  //     setSignature(signature);
  //   };

  //   /// use ethers.js to create signature
  //   const createSignatureEthers = async () => {
  //     const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  //     const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_FOUNDRY_PRIVATE_KEY_1 as `0x${string}`);
  //     const signer = wallet.connect(provider);
  //     console.log("Signer", signer);
  //     // /// very important!!! thats why viem is not working with just hi as a message
  //     // const message = ethers.getBytes(ethers.id(`hi`));
  //     /// to make it more secure
  //     const message = ethers.getBytes(userOpHash as `0x${string}`);
  //     console.log("Message ethers", message);
  //     const signature = await signer.signMessage(message);
  //     console.log("Signature", signature);
  //     setSignature(signature);
  //   };

  //   /// read count from account
  //   const publicClient = createPublicClient({
  //     chain: foundry,
  //     transport: http(),
  //   });

  //   const getCount = async () => {
  //     if (accountSimple) {
  //       const data = await publicClient.readContract({
  //         address: SMART_ACCOUNT as `0x${string}`,
  //         abi: accountSimple?.abi,
  //         functionName: "count",
  //       });
  //       console.log(data);
  //     }
  //   };

  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Sepolia Chain</h1>
      </div>
      <button
        className="btn btn-primary"
        onClick={() => {
          console.log("init Code", initCode);
          console.log(accountFactory);
          console.log("Sender", sender);
          console.log("Sender needs to be - 0xB77475d15E0274665aFbc1383Be9259CB241BcF0");
          console.log("Account 1", account1.address);
          console.log("Bytecode", createAccountEncoded);
          console.log(
            "Bytecode 0x6080604052348015600f57600080fd5b50604051610520380380610520833981016040819052602c916050565b600180546001600160a01b0319166001600160a01b0392909216919091179055607e565b600060208284031215606157600080fd5b81516001600160a01b0381168114607757600080fd5b9392505050565b6104938061008d6000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806306661abd146100515780633a871cdd1461006d57806361461954146100805780638da5cb5b1461008a575b600080fd5b61005a60005481565b6040519081526020015b60405180910390f35b61005a61007b36600461037e565b6100b5565b610088610160565b005b60015461009d906001600160a01b031681565b6040516001600160a01b039091168152602001610064565b7f19457468657265756d205369676e6564204d6573736167653a0a3332000000006000908152601c839052603c81208190610132906100f86101408801886103d2565b8080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061017692505050565b6001549091506001600160a01b03808316911614610151576001610154565b60005b60ff1695945050505050565b60008054908061016f83610420565b9190505550565b60008060008061018686866101a0565b92509250925061019682826101ed565b5090949350505050565b600080600083516041036101da5760208401516040850151606086015160001a6101cc888285856102af565b9550955095505050506101e6565b50508151600091506002905b9250925092565b600082600381111561020157610201610447565b0361020a575050565b600182600381111561021e5761021e610447565b0361023c5760405163f645eedf60e01b815260040160405180910390fd5b600282600381111561025057610250610447565b036102765760405163fce698f760e01b8152600481018290526024015b60405180910390fd5b600382600381111561028a5761028a610447565b036102ab576040516335e2f38360e21b81526004810182905260240161026d565b5050565b600080807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08411156102ea5750600091506003905082610374565b604080516000808252602082018084528a905260ff891692820192909252606081018790526080810186905260019060a0016020604051602081039080840390855afa15801561033e573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b03811661036a57506000925060019150829050610374565b9250600091508190505b9450945094915050565b60008060006060848603121561039357600080fd5b833567ffffffffffffffff8111156103aa57600080fd5b840161016081870312156103bd57600080fd5b95602085013595506040909401359392505050565b6000808335601e198436030181126103e957600080fd5b83018035915067ffffffffffffffff82111561040457600080fd5b60200191503681900382131561041957600080fd5b9250929050565b60006001820161044057634e487b7160e01b600052601160045260246000fd5b5060010190565b634e487b7160e01b600052602160045260246000fdfea264697066735822122094a94f4f46ddc2541893757973004246ec14c72aa0457031e1a2ec85044736b664736f6c63430008190033000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          );
        }}
      >
        Click Me for Info
      </button>
      <button
        className="btn btn-secondary"
        onClick={async () => {
          try {
            console.log("Deposit To Sender", sender);
            await entryPointWriteFunction({
              functionName: "depositTo",
              args: [PM_ADDRESS],
              value: parseUnits("100", 18),
            });
          } catch (e) {
            console.error("Error setting greeting:", e);
          }
        }}
      >
        1. Deposit to Account / Paymaster
      </button>
      <button
        className="btn btn-secondary"
        onClick={async () => {
          try {
            const sender = await entryPointWriteFunction({
              functionName: "getSenderAddress",
              args: [initCode as `0x${string}`],
            });
            console.log(sender);
          } catch (ex) {
            console.error("Error setting greeting:");
          }
        }}
      >
        2. Get sender
      </button>
      <button className="btn btn-secondary" onClick={() => createUserOpHash()}>
        3. Create User OP Hash
      </button>
      <button className="btn btn-secondary" onClick={() => createSignatureEthers()}>
        4. Sign User OP with Ethers
      </button>
      <button className="btn btn-secondary" onClick={() => createSignature()}>
        4. Sign User OP with Viem
      </button>
      {/* <button
        className="btn btn-primary"
        onClick={async () => {
          try {
            console.log("User Op", userOp);
            console.log("Account 1", account1.address);
            /// add signature to userOp
            userOp.signature = signature;
            console.log("User Op with Signature attached", userOp);
            await entryPointWriteFunction({
              functionName: "getSenderAddress",
              args: [sender],
            });
          } catch (e) {
            console.error("Error setting greeting:", e);
          }
        }}
      >
        5. Run handleOps in the EntryPoint contract
      </button> */}
      <button className="btn btn-secondary" onClick={() => getCount()}>
        6. Check - Get count of smart contract
      </button>
    </>
  );
};

export default LocalChain;
