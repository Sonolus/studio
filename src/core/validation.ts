export type Validator<T> = (value: T) => boolean

export function validateInput<T>(
    props: {
        modelValue: T
        validate?: boolean
        validator?: Validator<T>
    },
    defaultValidator: Validator<T>
) {
    if (!props.validate) return true
    return (props.validator || defaultValidator)(props.modelValue)
}
