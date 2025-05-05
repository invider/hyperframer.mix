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
    const { cur, getc, retc, aheadc, skipc, eos, src } = stream

    const lines = [],
          lineMarks = [ cur() ]
    let   lineNum = 0

    function lineAtPos(pos) {
        // TODO figure out what to do if the pos is not parsed yet or outside of the parsing window (< start)!
        for (let i = 0; i < lineMarks.length; i++) {
            const mark = lineMarks[i]
            if (pos < mark) return {
                lineNum: i - 1,
                linePos: pos - lineMarks[i - 1]
            }
        }
        return {
            lineNum: lineNum,
            linePos: pos - lineMarks[lineNum]
        }
    }

    function extractLine(ln) {
        if (ln < 0) return

        if (ln < lineNum) {
            return lines[ln]
        } else {
            const lines = stream.src.split('\n').map(l => {
                if (l.endsWith('\r')) return l.substring(l.length - 1)
                else return l
            })
            return lines[ln]
        }
    }

    function extractLines(from, to) {
        const buf = []
        for (let ln = from; ln <= to; ln++) {
            const line = extractLine(ln) 
            if (line !== undefined) buf.push(line)
        }
        return buf.join('\n')
    }

    function xerr(msg, pos) {
        pos = pos ?? cur()
        nextLine() // make sure we have buffered the current line for proper output

        const at    = lineAtPos(pos),
              lines = extractLines(at.lineNum - 4, at.lineNum)
              
        throw new Error(`${msg} @${at.lineNum+1}.${at.linePos+1}:\n${lines}\n${lpad('', at.linePos)}^`)
    }

    function eatNewLine() {
        if (!isNewLine(aheadc())) return false

        const startsAt = lineMarks[lineNum],
              endsAt   = cur(),
              line     = stream.src.substring(startsAt, endsAt),
              c = getc()
        if (c === '\r' && aheadc() === '\n') skipc()

        lines[lineNum++] = line
        lineMarks[lineNum] = cur()

        return true
    }

    function nextLine() {
        if (eos()) return

        const buf = []
        let   curLine = true

        while (curLine) {
            if (eatNewLine() || eos()) {
                curLine = false
            } else {
                buf.push( getc() )
            }
        }

        return buf.join('')
    }

    return {
        xerr,
        stream,
        nextLine,

        curLine: () => lineNum,
    }
}
