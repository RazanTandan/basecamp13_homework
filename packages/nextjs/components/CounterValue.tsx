"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";

export const CounterValue = () => {
  const { data, isLoading, error } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "get_counter",
  });

  if (error) return <span className="text-error text-sm">Failed to load counter</span>;
  if (isLoading || data === undefined) {
    return (
      <div className="flex items-center justify-center p-4">
        <span className="animate-pulse text-xl text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Current Counter Value</h2>
      <span className="font-mono text-5xl font-bold text-gray-800">
        {String(data)}
      </span>
    </div>
  );
};