'use client';

import { useScaffoldMultiWriteContract, createContractCall } from '~~/hooks/scaffold-stark/useScaffoldMultiWriteContract';
import { useDeployedContractInfo } from '~~/hooks/scaffold-stark/useDeployedContractInfo';
import useScaffoldStrkBalance from '~~/hooks/scaffold-stark/useScaffoldStrkBalance';
// import { CONTRACT_NAME } from '~~/utils/constants';
import { uint256 } from 'starknet';

const DECIMALS = 18n;
const PAYMENT_TOKENS = 1n; // single source of truth for cost in STRK units
const PAYMENT_AMOUNT = uint256.bnToUint256(PAYMENT_TOKENS * 10n ** DECIMALS);
const CONTRACT_NAME = "CounterContract";

interface ResetCounterProps {
  counter: number;
  connectedAddress: string;
  ownerAddress: string;
}

export const ResetCounterButton = ({ counter, connectedAddress, ownerAddress }: ResetCounterProps) => {
  const { data: counterContract } = useDeployedContractInfo(CONTRACT_NAME);
  const counterAddress = counterContract?.address;

  const { value: strkBalance } = useScaffoldStrkBalance({ address: connectedAddress });

  const isOwner = (connectedAddress && ownerAddress) ? BigInt(connectedAddress) === BigInt(ownerAddress) : false;

  const isZero = counter === 0;
  const hasEnoughBalance = (strkBalance ?? 0n) >= PAYMENT_TOKENS * 10n ** DECIMALS;

  const resetCall = {
    contractName: CONTRACT_NAME,
    functionName: 'reset_counter',
    args: [],
  };

  let calls: any[] = [];
  if (isOwner) {
    calls = [resetCall];
  } else if (counterAddress) {
    calls = [
      createContractCall('Strk', "approve", [counterAddress, PAYMENT_AMOUNT]),
      resetCall,
    ];
  }

  const { sendAsync, isPending } = useScaffoldMultiWriteContract({ calls });

  const handleResetCounter = async () => {
    try {
      await sendAsync();
    } catch (e) {
      console.error("Error resetting counter", e);
    }
  };

  return (
    <button
      title={!isOwner ? `Resetting the counter costs ${PAYMENT_TOKENS.toString()} STRK` : undefined}
      onClick={handleResetCounter}
      disabled={isPending || isZero || (!isOwner && !hasEnoughBalance) || calls.length === 0}
      className="btn btn-primary"
    >
      Reset Counter
    </button>
  );
};