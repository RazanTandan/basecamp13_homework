"use client";
import { useState, ChangeEvent } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";


interface SetCounterProps {
  connectedAddress: string;
  ownerAddress: string;
}

export const SetCounter = ({ connectedAddress, ownerAddress }: SetCounterProps) => {
  const [value, setValue] = useState<string>('');

  const isOwner = connectedAddress && ownerAddress
    ? BigInt(connectedAddress) === BigInt(ownerAddress)
    : false;

  const { sendAsync, isPending } = useScaffoldWriteContract({
    contractName: "CounterContract",
    functionName: "set_counter",
    args: [undefined],
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if ((/^\d*$/.test(next))) setValue(next);
  };

  const disabled = isPending || !isOwner || value === "";

  const onSet = async () => {
    try {
      await sendAsync({ args: [Number(value)] });
      setValue("");
    } catch (e) {
      console.error("Error setting counter", e);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="input input-bordered w-32"
        placeholder="New value"
        value={value}
        onChange={onChange}
      />
      <button className="btn btn-primary" onClick={onSet} disabled={disabled}>
        Set Counter
      </button>
    </div>
  );
};