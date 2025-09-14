"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";

export const DecreaseCounterButton = () => {
  const { data } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "get_counter",
  });

  const { sendAsync, status } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "decrease_counter",
    args: [],
  });

  const valueNum = data ? Number(data) : 0;

  const isBusy = status === "pending";
  const isDisabled = isBusy || data === undefined || valueNum <= 0;

  return (
    <button
      className="btn btn-primary btn-sm"
      onClick={() => sendAsync()}
      disabled={isDisabled}
      title={valueNum <= 0 ? "Counter is already 0" : undefined}
    >
      {isBusy ? "Decreasing..." : "-1"}
    </button>
  );
};