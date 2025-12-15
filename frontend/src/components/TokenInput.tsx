import { Input } from "./ui/input"
import { Label } from "./ui/label"

interface TokenInputProps {
    label: string
    token: string
    setToken: (a: string) => void
    amount?: string
    setAmount?: (a: string) => void
}

export function TokenInput({ label, token, setToken, amount, setAmount }: TokenInputProps) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>

            <Input
                placeholder="Token address"
                value={token}
                onChange={(e) => setToken(e.target.value)}
            />

            {setAmount && (
                <Input
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1"
                />
            )}
        </div>
    )
}
