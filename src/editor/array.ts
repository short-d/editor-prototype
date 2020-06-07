export function remove<T>(arr: T[], idx: number, count: number = 1): T[] {
    return [
        ...arr.slice(0, idx),
        ...arr.slice(idx + count)
    ];
}

export function insert<T>(arr: T[], idx: number, slice: T[]): T[] {
    return [
        ...arr.slice(0, idx),
        ...slice,
        ...arr.slice(idx)
    ];
}