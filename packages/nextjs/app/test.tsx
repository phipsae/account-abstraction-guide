import { createTestClient, http } from "viem";
import { foundry } from "viem/chains";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

export const Test = () => {
  const client = createTestClient({
    chain: foundry,
    mode: "anvil",
    transport: http(),
  });

  const { data: test } = useScaffoldContract({
    contractName: "Test",
  });

  return (
    <>
      <div>
        <p>HUHU</p>
      </div>
    </>
  );
};
