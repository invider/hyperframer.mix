/*
function isSpace(c) {
    return c === ' ' || c === '\t'
}

function isNewLine(c) {
    return c === '\r' || c === '\n'
}

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

// TODO how to handle tabs? Maybe if tabs are there, then indentation MUST be tabs-only!
const TAB     = 4

const EOL     = 0,
      INDENT  = 1,
      CONTENT = 2

// create a line tokenizer over the provided stream, returns the next() function
function lines(stream) {
    const { slice, cur, getc, getcc, retc, aheadc, aheadcc, skipc, eos, xerr } = stream

    function eatNewLine() {
        const code = aheadcc()
        if (code !== 0x0D && code !== 0x0A) return 0

        skipc()
        if (code === 0x0D && aheadcc() === 0x0A) {
            skipc()
            return 2
        }
        return 1
    }

    function next() {
        if (eos()) return


        const at = cur()

        let indent  = 0,
            outdent = 0,
            block   = false,
            span    = 1,
            eol     = 0,
            state   = INDENT
        let prevc, spans, spanDir

        function closeSpan() {
            if (span <= 2) {
                span = 1
                return
            }

            if (!spans) {
                spans   = []
                spanDir = {}
            }

            const lastSpan = {
                ch:  prevc,
                at:  cur() - at - span - 1,
                len: span,
            }
            spans.push(lastSpan)
            if (!spanDir[prevc] || spanDir[prevc].len < span) {
                spanDir[prevc] = lastSpan
            }
            span = 1
        }

        while (state) {
            if ((eol = eatNewLine()) || eos()) {
                state = EOL
                closeSpan()
            } else {
                const c = getc()

                switch(state) {
                    case INDENT:
                        if (c === ' ') {
                            indent ++
                        } else if (c === '\t') {
                            ident += TAB
                        } else {
                            state = CONTENT
                            block = true
                        }
                        break
                    case CONTENT:
                        if (c === ' ') {
                            outdent++
                            closeSpan()
                        } else if (c === '\t') {
                            outdent += TAB
                            closeSpan()
                        } else {
                            if (outdent > 0) block = false
                            outdent = 0
                            if (c === prevc) {
                                span++
                            } else {
                                closeSpan()
                            }
                        }
                        break
                }

                prevc = c
            }
        }
        let til = cur()

        const len = til - at - eol
        const lineSlice = {
            type: 'lineSlice',
            ln:   slice.lineNumberAt(at),
            at,
            til,
            len,
            val:  slice.subSlice(at, til),
            EOL:  eol, // 0 - EOF, 1 - CR/LF, 2 - CRLF
            indent,
            outdent,
            block,
            contentLen: len - indent - outdent, 
            getContent: function() {
                return this.val.src.substring(this.at + this.indent, this.til - this.outdent - this.EOL)
            },
            txt:  env.config.debugSlices? stream.src.substring(at, til) : null,
        }

        if (spans) {
            lineSlice.spans = spans
            lineSlice.span  = spanDir
        }

        return lineSlice
    }

    return next
}
