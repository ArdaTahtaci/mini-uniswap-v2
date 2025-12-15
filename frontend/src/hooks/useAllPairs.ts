import { useReadContract, useReadContracts } from "wagmi";
import { CONTRACTS, FACTORY_ABI } from "../contracts";
import { useMemo } from "react";

/**
 * Hook to fetch all pair addresses from the factory
 */
export function useAllPairs() {
    // 1️⃣ Fetch total pair count
    const { data: pairsLength, isLoading: isLoadingLength } = useReadContract({
        address: CONTRACTS.FACTORY,
        abi: FACTORY_ABI,
        functionName: "allPairsLength",
        query: {
            refetchInterval: 5000, // Refetch every 5 seconds to catch new pairs
        },
    });


    // 2️⃣ Normalize to number (IMPORTANT)
    const totalPairs = pairsLength ? Number(pairsLength) : 0;



    // 3️⃣ Build contracts list only when length is known
    const pairContracts = useMemo(() => {
        if (!pairsLength || totalPairs === 0) return [];

        return Array.from({ length: totalPairs }, (_, i) => ({
            address: CONTRACTS.FACTORY,
            abi: FACTORY_ABI,
            functionName: "allPairs",
            args: [BigInt(i)],
        }));
    }, [pairsLength, totalPairs]);




    // 4️⃣ Read all pair addresses
    const { data: pairResults, isLoading: isLoadingPairs } = useReadContracts({
        contracts: pairContracts,
        query: {
            enabled: pairContracts.length > 0,
            refetchInterval: 5000, // Refetch every 5 seconds
        },
    });
    console.log("pairsLength (raw):", pairsLength);
    console.log("totalPairs:", totalPairs);
    console.log("pairContracts.length:", pairContracts.length);
    console.log("pairResults:", pairResults);
    // 5️⃣ Extract successful results
    const pairs =
        pairResults
            ?.map((result) =>
                result.status === "success" ? result.result : null
            )
            .filter(
                (pair): pair is `0x${string}` =>
                    typeof pair === "string" && pair.startsWith("0x")
            ) ?? [];

    return {
        pairs,
        totalPairs,
        isLoading: isLoadingLength || isLoadingPairs,
    };
}
