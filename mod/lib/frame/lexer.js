function isSpace(c) {
    return c === ' ' || c === '\t'
}

function isNewLine(c) {
    return c === '\r' || c === '\n'
}

function isSeparator(c) {
    return isSpace(c) || isNewLine(c) || isOperator(c)
}

function isDigit(c) {
    const code = c.charCodeAt(0) - 48
    return code >= 0 && code < 10
}

function toDec(c) {
    const code = c.charCodeAt(0) - 48
    if (code >= 0 && code < 10) return code
    else return -1
}

function isHex(c) {
    const code = c.toUpperCase().charCodeAt(0) - 48
    return (code >= 0 && code < 10) || (code >= 17 && code < 23)
}

function toHex(c) {
    const code = c.toUpperCase().charCodeAt(0) - 48
    if (code >= 0 && code < 10) return code
    else if (code >= 17 && code < 23) return code - 7
    else return -1
}

function lexer(stream) {
    const { getc, retc, aheadc, skipc, eos } = stream

    function nextLine() {
        if (eos()) return

        const buf = []
        let   c, 
              curLine = true

        while (curLine) {
            c = getc()
            if (!c || isNewLine(c)) {
                if (c === '\r' && aheadc() === '\n') skipc()
                curLine = false
            } else {
                buf.push(c)
            }
        }

        return buf.join('')
    }

    return {
        stream,
        nextLine,
    }
}
