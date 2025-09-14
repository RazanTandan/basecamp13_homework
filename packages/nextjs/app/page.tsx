"use client";

import { CounterValue } from "~~/components/CounterValue";
import { IncreaseCounterButton } from "~~/components/IncreaseCounter";
import { DecreaseCounterButton } from "~~/components/DecreaseCounter";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useAccount } from "~~/hooks/useAccount";
import { ResetCounterButton } from "~~/components/ResetCounter";
import { SetCounter } from "~~/components/SetCounter";
import { CounterEvents } from "~~/components/ListCounterEvents";

const Home = () => {
  const { data, isLoading, error } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "get_counter",
  });

  const counter = data ? Number(data) : 0;

  const { data: ownerAddress } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "owner",
  });

  const ownerAddressStr = (ownerAddress) ? ownerAddress.toString() : "";

  const { address: connectedAddress } = useAccount();
  const connectedAddressStr = connectedAddress ?? "";

  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="text-lg"> <CounterValue />  </div>
      <div className="pt-2"> <IncreaseCounterButton /> <DecreaseCounterButton /> <ResetCounterButton counter= {counter} connectedAddress = {connectedAddressStr} ownerAddress = {ownerAddressStr} /></div>
      <div className="pt-2"><SetCounter connectedAddress={connectedAddressStr} ownerAddress={ownerAddressStr} /></div>
      <CounterEvents />
    </div>
  );
};


export default Home;
