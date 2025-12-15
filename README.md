# MiniDEX — Mini Uniswap V2 (Base Sepolia)

A complete, minimal Uniswap V2–style DEX built end-to-end: **Factory + Pair + Router + UI**.

This repo includes:

* **Solidity contracts** (Factory / Pair / Router + ERC-20 test tokens)
* **Foundry scripts** to deploy and seed multiple pools with liquidity
* **React (Vite) UI** to browse markets, inspect pool stats, add/remove liquidity, approve tokens, and swap with safety checks

> Target network: **Base Sepolia** (chainId: **84532**)

---

## What you can do

### Markets

* Discover pools **on-chain** from the Factory (`allPairsLength` + `allPairs(i)`).
* View available markets and open a pair cockpit.

### Swap

* Quote output amounts from live reserves.
* **Approve → Swap** flow.
* **Price impact warning** in the UI (based on pool reserves and trade size).
* Real-time reserve refresh.

### Liquidity

* **Add liquidity** to existing pools via the Router.
* **Remove liquidity** and redeem underlying tokens.
* LP balances and pool share visibility (where applicable).

---

## Tech Stack

### Frontend

* **Bun**
* **Vite + React + TypeScript**
* **Tailwind CSS v4** + `@tailwindcss/postcss`
* **wagmi v3** + **viem v2**
* **@tanstack/react-query**
* Component-based UI (shadcn-style patterns)

### Contracts

* **Solidity 0.8.20**
* **Foundry** (`forge`, `cast`)

---

## Repo Structure

```
.
├─ contracts/
│  ├─ src/
│  │  ├─ MiniFactory.sol
│  │  ├─ MiniPair.sol
│  │  ├─ MiniRouter.sol
│  │  └─ TestToken.sol
│  ├─ script/
│  │  ├─ InitDexFromStart.s.sol
│  │  ├─ AddNewTokensAndPools.s.sol
│  │  └─ (other scripts)
│  ├─ foundry.toml
│  └─ .env (local)
│
├─ src/
│  ├─ lib/
│  │  └─ wagmi.ts
│  ├─ hooks/
│  │  ├─ useAllPairs.ts
│  │  ├─ usePair.ts
│  │  ├─ usePairTokens.ts
│  │  ├─ useReserves.ts
│  │  ├─ useSwap.ts
│  │  ├─ useAddLiquidity.ts
│  │  └─ useRemoveLiquidity.ts
│  ├─ pages/
│  │  ├─ Dashboard.tsx
│  │  ├─ Markets.tsx
│  │  ├─ Swap.tsx
│  │  └─ Liquidity.tsx
│  ├─ components/
│  ├─ App.tsx
│  └─ index.css
│
├─ contracts.ts
└─ package.json
```

> Exact file names may differ slightly depending on your local refactors.

---

## Quickstart (Frontend)

### Install

```bash
bun install
```

### Run

```bash
bun dev
```

Open the local URL printed by Vite.

---

## Environment Variables

Create `contracts/.env` with:

```env
BASE_SEPOLIA_RPC=YOUR_BASE_SEPOLIA_RPC_URL
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

Load into your shell:

```bash
cd contracts
source .env
```

---

## Deploy & Seed (Contracts)

Run scripts from `contracts/`.

### Deploy core + seed pools

```bash
cd contracts
source .env
forge script script/InitDexFromStart.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Add additional tokens and pools (optional)

```bash
forge script script/AddNewTokensAndPools.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast
```

---

## Frontend Configuration

### Contract addresses

All addresses live in `contracts.ts`.

Example:

```ts
export const CONTRACTS = {
  TRUMP: "0x...",
  PENGU: "0x...",
  WETH:  "0x...",
  USDC:  "0x...",
  FACTORY: "0x...",
  ROUTER:  "0x...",
} as const;
```

### ABI typing (important)

If ABIs are imported from JSON, type them as `Abi` for wagmi/viem compatibility:

```ts
import type { Abi } from "viem";
import FactoryAbiJson from "./abi/MiniFactory.json";

export const FACTORY_ABI = FactoryAbiJson as Abi;
```

---

## Notes on Prices & Reserves

* Pairs store reserves as `(reserve0, reserve1)` for `(token0, token1)`.
* UI maps reserves into the **user-selected token order**.
* Tokens can have different decimals (e.g., 18 vs 6). All displayed amounts are normalized to human-readable values.
* **Price impact** is computed from pool reserves + trade size and surfaced as a warning in the swap flow.

---

## Network

* Chain: **Base Sepolia**
* Chain ID: **84532**

Ensure your wallet is connected to Base Sepolia.

---

## License

MIT (or your preferred license). Add/adjust as needed.
