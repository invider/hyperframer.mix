const TAB = 4

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

// TODO move to collider.jam text routines along with rpad() and hex/dec functions?
function lpad(s, N) {
    const n = N - s.length
    for (let i = 0; i < n; i++) {
        s = ' ' + s
    }
    return s
}

function lexer(stream) {
    const { cur, getc, retc, aheadc, skipc, slice, eos } = stream

    //const lines = [],
    //      lineMarks = [ cur() ]
    //let lineNum = 0


    function xerr(msg, pos) {
        pos = pos ?? cur()

        const at    = slice.lineCoordAt(pos),
              lines = slice.extractLines(at.lineNum - 4, at.lineNum)
              
        throw new Error(`${msg} @${at.lineNum+1}.${at.linePos+1}:\n${lines}\n${lpad('', at.linePos)}^`)
    }

    function eatNewLine() {
        if (!isNewLine(aheadc())) return 0

        const c = getc()
        if (c === '\r' && aheadc() === '\n') {
            skipc()
            return 2
        }

        return 1
    }

    function nextLine() {
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

    function rewind(shift) {
        const askPos = cur() + shift
        if (shift > 0 || askPos < 0) throw new Error(`Wrong rewind value [${shift}] for position [${cur()}]`)
        const newPos = stream.seek(askPos)
        const at = stream.slice.lineCoordAt(newPos)
        return newPos
    }

    return {
        stream,

        xerr,
        nextLine,

        rewind,
        curLine: () => lineNum,
    }

}
