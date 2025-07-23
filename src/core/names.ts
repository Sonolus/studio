export function formatNameKey(key: string) {
    return key
        .split('')
        .map((char) => (char.toUpperCase() === char ? ` ${char}` : char))
        .join('')
        .trim()
}
