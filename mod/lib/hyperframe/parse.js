function matchHeader(line, leadc, level) {
    for (let i = 0; i < line.length; i++) {
        if (line.charAt(i) !== leadc) return
    }
    return {
        type:  leadc,
        level: level,
        len:   line.length,
    }
}

function matchHeaders(line) {
    switch(line.charAt(0)) {
        case '=': return matchHeader(line, '=', 1)
        case '-': return matchHeader(line, '-', 2)
    }
}

function matchTags(line) {
    line = line.trim()
    if (line.charAt(0) === '#') {
        const tags = []
        const parts = line.split(' ')
        parts.forEach(t => {
            if (t.startsWith('#')) tags.push(t.substring(1))
        })
        return tags
    }
    return
}

function matchFlags(tags) {
    if (tags.length > 1) return
    switch(tags[0]) {
        case 'slides':
            return tags[0]
    }
}

function parse(slice) {
    const flags  = {}
    const stream = lib.hyperframe.stream(slice)
    const nextLine = lib.hyperframe.lex.lines(stream)

    function parseFrame() {
        // handle subframe parsing with specialized preprocessor/lexer/parser pipelines
    }

    function doFrame(level, title, nextFrame) {

        const frame = nextFrame || new dna.HyperFrame({
            at:     stream.cur(),
            level:  level,
            title:  title ?? '',
            lines:  [],
            tokens: [],
        })

        // go over the source line by line 
        let prev, line = nextLine()

        while (line !== undefined) {
            //log(`#${line.ln+1}:[${line.val}]`)

            /*
            // multi-line header
            if (prev && prev.val.length > 0) {
                // we had a non-empty line before this one

                let headerTk = matchHeaders(line.val)
                if (headerTk) {
                    const headerTitle = frame.lines.pop()
                    const lastToken   = frame.tokens.pop()
                    if (headerTk.level > level) {
                        const nextFrame = new dna.HyperFrame({
                            at:     lastToken.at,
                            level:  level,
                            title:  title ?? '',
                            lines:  [],
                            tokens: [],
                        })
                        nextFrame.lines.push(headerTitle)
                        nextFrame.tokens.push(lastToken)
                        nextFrame.lines.push(line.val)
                        nextFrame.tokens.push(headerTk)

                        const subFrame = doFrame(headerTk.level, prev.val, nextFrame)
                        if (subFrame) frame.attach(subFrame)

                        line = null
                    } else {
                        // same level - close the current frame and return
                        // TODO throw away prev line?
                        // rewind to the prev position
                        stream.rewind(stream.cur() - prev.at)
                        frame.til = prev.at

                        // detected the frame end, perfect time to create a slice for it
                        frame.slice = new dna.SourceSlice({
                            __:    stream.slice,
                            start: frame.at,
                            end:   frame.til,
                        })
                        // DEBUG preserve the source for debug purposes
                        frame.src = frame.slice.toString()

                        parseFrame(frame)
                        return frame
                    }
                }
            }
            */

                /*
                // DEBUG test error example
                if (line.val.includes('markup')) stream.xerr('it is not lightweight at all!',
                    line.at + line.val.indexOf('markup'))
                */

            /*
            if (line) {
                const tags = matchTags(line.val)
                if (tags) {
                    frame.tags = tags
                    if (level === 0) {
                        const flag = matchFlags(tags)
                        if (flag) flags[flag] = true
                    }
                }

                if (flags.slides) {
                    const tline = line.val.trim()
                    if (tline.startsWith('-')) {
                        frame.attach({
                            type: 'item',
                            val: tline.substring(1).trim(),
                        })
                    }
                }

                frame.lines.push(line.val)
                frame.tokens.push(line)
                prev = line
            } else {
                prev = null
            }
            */
            console.dir(line)

            line = nextLine()
        }

        frame.til = stream.cur()
        frame.slice = new dna.SourceSlice({
            __:    stream.slice,
            start: frame.at,
            end:   frame.til,
        })
        return frame
    }

    const root = doFrame(0, name)
    root.slice = slice
    root.src   = slice.getSource()
    root.totalLength = root.src.length

    return root
}
