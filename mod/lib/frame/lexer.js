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
    const { cur, getc, retc, aheadc, skipc, eos } = stream

    const lines = [],
          lineMarks = [ cur() ]
    let lineNum = 0


    function xerr(msg, pos) {
        pos = pos ?? cur()

        const at    = stream.slice.lineCoordAt(pos),
              lines = stream.slice.extractLines(at.lineNum - 4, at.lineNum)
              
        throw new Error(`${msg} @${at.lineNum+1}.${at.linePos+1}:\n${lines}\n${lpad('', at.linePos)}^`)
    }

    function eatNewLine() {
        if (!isNewLine(aheadc())) return false

        const startsAt = lineMarks[lineNum],
              endsAt   = cur(),
              // TODO not optimal - refactor out to the root slice
              line     = stream.src.substring(startsAt, endsAt),
              c = getc()
        if (c === '\r' && aheadc() === '\n') skipc()

        lines[lineNum++] = line
        lineMarks[lineNum] = cur()

        return true
    }

    function nextLine() {
        if (eos()) return

        const at  = cur(),
              ln  = lineNum,
              buf = []
        let   curLine = true

        while (curLine) {
            if (eatNewLine() || eos()) {
                curLine = false
            } else {
                buf.push( getc() )
            }
        }

        return {
            type: 'line',
            at:   at,
            ln:   ln,
            val:  buf.join(''),
            len:  buf.length,
            til:  cur(),
        }
    }

    function rewind(shift) {
        const askPos = cur() + shift
        if (shift > 0 || askPos < 0) throw new Error(`Wrong rewind value [${shift}] for position [${cur()}]`)
        const newPos = stream.seek(askPos)
        const at = stream.slice.lineCoordAt(newPos)
        lineNum = at.lineNum
        return newPos
    }

    return {
        xerr,
        stream,
        nextLine,

        rewind,
        curLine: () => lineNum,
    }

}
