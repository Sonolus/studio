export type Expression = Record<string, number>

export function expressionToEquation(expression: Expression) {
    let equation = `${expression.c}`

    for (const [variable, value] of Object.entries(expression)) {
        if (variable === 'c') continue
        if (!value) continue

        equation += value < 0 ? `${value}` : `+${value}`
        equation += `*${variable}`
    }

    return equation.startsWith('0+')
        ? equation.slice(2)
        : equation.startsWith('0-')
        ? equation.slice(1)
        : equation
}

export function createEquationToExpression<T extends Expression>(allZero: T) {
    type Token = '+' | '-' | '*' | '/' | number | { name: keyof T }

    const names = Object.keys(allZero).filter((key) => key !== 'c')

    return equationToExpression

    function equationToExpression(equation: string) {
        try {
            return parseSum(lex(equation))
        } catch {
            return
        }
    }

    function lex(equation: string) {
        return equation
            .split(/([+\-*/])/)
            .map((segment) => segment.trim())
            .filter((segment) => segment)
            .map((segment): Token => {
                switch (segment) {
                    case '+':
                    case '-':
                    case '*':
                    case '/':
                        return segment
                }

                if (names.includes(segment)) return { name: segment }

                const value = +segment
                if (Number.isNaN(value)) throw 'Invalid number'

                return value
            })
    }

    function parseSum(tokens: Token[]) {
        let lhs = parseProduct(tokens)

        let token
        while ((token = tokens.shift())) {
            if (token === '+') {
                const rhs = parseProduct(tokens)
                lhs = add(lhs, rhs)
            } else if (token === '-') {
                const rhs = parseProduct(tokens)
                lhs = add(lhs, multiply(rhs, -1))
            } else {
                throw 'Invalid sum'
            }
        }

        return lhs
    }

    function parseProduct(tokens: Token[]) {
        let lhs = parseTerm(tokens)

        let token
        while ((token = tokens.shift())) {
            if (token === '*') {
                const rhs = parseTerm(tokens)
                if (isConstant(lhs)) {
                    lhs = multiply(rhs, lhs.c)
                } else if (isConstant(rhs)) {
                    lhs = multiply(lhs, rhs.c)
                } else {
                    throw 'Cannot multiply variables'
                }
            } else if (token === '/') {
                const rhs = parseTerm(tokens)
                if (!isConstant(rhs)) throw 'Cannot divide by variable'

                lhs = multiply(lhs, 1 / rhs.c)
            } else {
                tokens.unshift(token)
                break
            }
        }

        return lhs
    }

    function parseTerm(tokens: Token[], multiplier = 1) {
        const token = tokens.shift()
        if (token === undefined) throw 'Unexpected end of equation'

        if (typeof token === 'number') {
            return { ...allZero, c: multiplier * token } as T
        } else if (typeof token === 'object') {
            return { ...allZero, [token.name]: multiplier }
        } else if (token === '-') {
            return parseTerm(tokens, -multiplier)
        }

        throw 'Invalid term'
    }

    function isConstant(expression: T) {
        return names.every((name) => expression[name] === 0)
    }

    function add(lhs: T, rhs: T) {
        return Object.fromEntries(
            Object.entries(lhs).map(([k, v]) => [k, v + rhs[k as never]]),
        ) as T
    }

    function multiply(expression: T, multiplier: number) {
        return Object.fromEntries(
            Object.entries(expression).map(([k, v]) => [k, v * multiplier]),
        ) as T
    }
}
