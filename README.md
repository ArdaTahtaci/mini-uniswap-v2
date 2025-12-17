# MiniDEX — Mini Uniswap V2 (Base Sepolia)

A complete, minimal Uniswap V2–style DEX built end-to-end: **Factory + Pair + Router + UI**.

<img width="1724" height="962" alt="image" src="https://github.com/user-attachments/assets/ef81f7c6-818e-472a-b610-55f5289c01a4" />

---

https://github.com/user-attachments/assets/416bc01d-22bb-4b22-9642-566b349a414a

---


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

### What this project demonstrates

**Protocol engineering fundamentals**
* **AMM mechanics ($x \cdot y = k$):** constant-product pricing driven by pool reserves.
* **Liquidity provisioning**
    * deposit two assets into a pool
    * mint LP tokens representing pool share
    * burn LP tokens to withdraw proportional reserves
* **On-chain market discovery via Factory**
    * read `allPairsLength()` and `allPairs(i)` from the UI
    * resolve pools with `getPair(tokenA, tokenB)`
* **Swap execution** through a Router abstraction that routes to the correct pair.

**Web3 integration & UX**
* **Wallet connection + network config** for Base Sepolia (chainId: `84532`).
* **Read/write contract flows** with `wagmi` (v3) + `viem` (v2).
* **ERC-20 approve → action flows** for swaps and liquidity.
* **Correct handling of:**
    * token decimals (18 vs 6)
    * canonical ordering (`token0`/`token1`) vs UI-selected order
    * reserve normalization for human-readable prices
* **Price impact warning** in the swap flow (based on reserves + trade size).

---

### Contracts 

This repo includes a minimal Uniswap V2–style suite:

* **MiniFactory**
    * creates pairs
    * stores pair addresses
    * exposes `allPairsLength()` / `allPairs(i)` and `getPair(...)`
* **MiniPair**
    * holds reserves
    * LP mint/burn
    * exposes `getReserves()` and token addresses
* **MiniRouter**
    * convenience methods to add/remove liquidity
    * swap entrypoints that interact with pairs
* **TestToken (ERC-20)**
    * used to create realistic markets on Base Sepolia
    * supports minting for seeding pools

> **Note:** Contracts are written in Solidity 0.8.20 and deployed/seeded using Foundry.

---

### Testing & validation

The focus was correctness and end-to-end behavior:

* **Verified reserve changes** after add/remove liquidity.
* **Verified swap outputs** match expectations based on live reserves.
* **Validated approvals/allowances** and common failure cases.
* **Confirmed UI state** matches on-chain state (pairs, reserves, pricing).

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
