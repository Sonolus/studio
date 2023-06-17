export function formatNameKey(key: string) {
    return [...key]
        .map((char) => (char.toUpperCase() === char ? ` ${char}` : char))
        .join('')
        .trim()
}
