/*
function isSpace(c) {
    return c === ' ' || c === '\t'
}
*/

function isNewLine(c) {
    return c === '\r' || c === '\n'
}

/*
function isSeparator(c) {
    return isSpace(c) || isNewLine(c)
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

*/

// create a lexer over the provided stream, returns the next() function
function lex(stream) {
    const { slice, cur, getc, retc, aheadc, skipc, eos, xerr } = stream

    function eatNewLine() {
        if (!isNewLine(aheadc())) return 0

        const c = getc()
        if (c === '\r' && aheadc() === '\n') {
            skipc()
            return 2
        }

        return 1
    }

    function next() {
        if (eos()) return

        const at = cur()
        let til = at,
            curLine = true

        while (curLine) {
            if (eatNewLine() || eos()) {
                curLine = false
            } else {
                skipc()
                til++
            }
        }

        return {
            type: 'line',
            at:   at,
            ln:   slice.lineNumberAt(at),
            val:  slice.range(at, til),
            len:  til - at,
            til:  til,
        }
    }

    return next
}
