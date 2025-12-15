// import { useState } from "react";
// import { Panel } from "../components/layout/Panel";
// import { SectionTitle } from "../components/typography/SectionTitle";
// import { SwapBox } from "../components/SwapBox";
// import { CONTRACTS } from "../contracts";
// import { Input } from "../components/ui/input";
// import { Button } from "../components/ui/button";

// export function SwapPage() {
//     const [pairAddress, setPairAddress] = useState<string>(CONTRACTS.PAIR);

//     return (
//         <div className="space-y-6">
//             <SectionTitle title="Swap" subtitle="Trade tokens through any pair" />

//             <Panel className="space-y-5">
//                 <div className="space-y-3">
//                     <label className="text-sm text-muted-foreground">Pair Address</label>
//                     <div className="flex gap-3">
//                         <Input
//                             value={pairAddress}
//                             onChange={(e) => setPairAddress(e.target.value)}
//                             placeholder="0x..."
//                             className="font-mono text-sm"
//                         />
//                         <Button
//                             variant="secondary"
//                             onClick={() => setPairAddress(CONTRACTS.PAIR)}
//                         >
//                             Default
//                         </Button>
//                     </div>
//                 </div>

//                 {pairAddress && pairAddress.startsWith("0x") ? (
//                     <div className="pt-4 border-t border-white/10">
//                         <SwapBox initialPair={pairAddress as `0x${string}`} />
//                     </div>
//                 ) : (
//                     <div className="text-sm text-muted-foreground">Enter a valid pair address to start swapping</div>
//                 )}
//             </Panel>
//         </div>
//     );
// }
