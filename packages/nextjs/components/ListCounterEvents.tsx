"use client";

import { useScaffoldEventHistory } from "~~/hooks/scaffold-stark/useScaffoldEventHistory";

type CounterChangedParsedArgs = {
    caller: string;
    old_value: number;
    new_value: number;
    reason: Reason;
};

type Reason = {
    variant: Record<string, {}>;
};

const activeVariant = (reason: Reason): string => {
    const keys = Object.keys(reason.variant);
    if (keys.length === 0) {
        return "";
    } else if (keys.length === 1) {
        return keys[0];
    } else {
        return keys.find((k) => reason.variant[k]) ?? "";
    }
};

export const CounterEvents = () => {
    const { data, isLoading, error } = useScaffoldEventHistory({
        contractName: "CounterContract",
        eventName: "CounterChanged",
        fromBlock: 0n,
        watch: true,
        format: true,
    });

    if (isLoading) return <div>Loading events...</div>;
    if (error) return <div className="text-error">Error loading events</div>;

    // Function to determine the color class for the reason pill
    const getReasonColor = (reason: string) => {
        switch (reason.toLowerCase()) {
            case "set":
                return "bg-yellow-100 text-yellow-800";
            case "reset":
                return "bg-red-100 text-red-800";
            case "increase":
                return "bg-green-100 text-green-800";
            case "decrease":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };


    return (
        <div className="w-full max-w-xl mt-6">
            <h3 className="font-semibold mb-2">CounterChanged events</h3>
            <div className="bg-white p-4 rounded-lg shadow-md font-mono text-sm border border-gray-200">
                {data && data.length > 0 ? (
                    data.map((ev: { parsedArgs: CounterChangedParsedArgs }, idx: number) => (
                        <div key={idx} className="pb-4 mb-4 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                            <div className="flex flex-col md:flex-row md:items-center">
                                <div className="mb-2 md:mb-0 md:mr-4">
                                    <span className="font-bold text-gray-700">caller:</span>
                                    <span className="ml-1 text-gray-600 break-all">{ev.parsedArgs.caller}</span>
                                </div>
                                <div className="flex items-center gap-x-4">
                                    <div>
                                        <span className="font-bold text-gray-700">old:</span>
                                        <span className="ml-1 text-gray-600">{ev.parsedArgs.old_value}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-700">new:</span>
                                        <span className="ml-1 text-gray-600">{ev.parsedArgs.new_value}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-bold text-gray-700">reason:</span>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold uppercase ${getReasonColor(activeVariant(ev.parsedArgs.reason))}`}>
                                            {activeVariant(ev.parsedArgs.reason)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 italic">No events found.</div>
                )}
            </div>
        </div>
    );
};