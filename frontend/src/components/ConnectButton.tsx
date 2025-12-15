import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "./ui/button";

export function ConnectButton() {
    const { address, status } = useAccount();
    const { connectors, connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect();

    const isConnected = status === "connected";

    // Connect wallet
    async function handleConnect() {
        const connector = connectors[0];
        if (!connector) return;

        try {
            await connectAsync({ connector });
        } catch (err) {
            console.error("Connection error:", err);
        }
    }

    // Disconnect wallet
    async function handleDisconnect() {
        try {
            await disconnectAsync();
        } catch (err) {
            console.error("Disconnect error:", err);
        }
    }

    if (isConnected) {
        return (
            <Button variant="secondary" onClick={handleDisconnect}>
                {address?.slice(0, 6)}...{address?.slice(-4)}
            </Button>
        );
    }

    return (
        <Button onClick={handleConnect}>
            {status === "connecting" ? "Connecting..." : "Connect Wallet"}
        </Button>
    );
}
