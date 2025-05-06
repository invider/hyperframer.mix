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

function parse(src, name, path) {
    const stream = lib.frame.stream(src)
    const lexer = lib.frame.lexer(stream)

    function doFrame(level, title) {
        const frame = new $.dna.HyperFrame({
            at:     stream.cur(),
            level:  level,
            title:  title ?? '',
            lines:  [],
            tokens: [],
        })

        // go over the source line by line 
        let prev, line = lexer.nextLine()

        while (line !== undefined) {
            log(`#${line.ln+1}:[${line.val}]`)

            if (prev && prev.val.length > 0) {

                let header = matchHeaders(line.val)
                if (header) {
                    frame.lines.pop()
                    frame.tokens.pop()
                    if (header.level > level) {

                        const subFrame = doFrame(header.level, prev.val)
                        if (subFrame) frame.attach(subFrame)

                        line = null
                    } else {
                        // TODO throw away prev line?
                        // rewind to the prev position
                        lexer.seek(prev.at)
                        frame.til = prev.at - 1
                        frame.src = stream.src.substring(frame.at, frame.til)
                        return frame
                    }
                }
            }

            if (line) {
                frame.lines.push(line.val)
                frame.tokens.push(line)
                prev = line
            } else {
                prev = null
            }

            line = lexer.nextLine()
        }

        frame.til = stream.cur() - 1
        return frame
    }

    const root = doFrame(0, name)
    root.name = name
    root.path = path
    root.src  = src
    root.totalLength = src.length

    console.dir(root)
    return root
}
