import { injected } from '@wagmi/connectors'
import { baseSepolia } from 'wagmi/chains'
import { createConfig, http } from 'wagmi'

export const config = createConfig({
    chains: [baseSepolia],
    connectors: [
        injected({ target: "metaMask" }),
    ], transports: {
        [baseSepolia.id]: http(import.meta.env.VITE_BASE_SEPOLIA_RPC),
    },
})
