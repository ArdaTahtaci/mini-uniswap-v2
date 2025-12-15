export function isReserveTuple(
    value: unknown
): value is readonly [bigint, bigint] {
    return (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === "bigint" &&
        typeof value[1] === "bigint"
    );
}