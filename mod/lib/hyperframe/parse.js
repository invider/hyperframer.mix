const CONTENT = 1,
      HEADER  = 2

function matchContiniousDoubleLine(lineTk) {
    if (!lineTk.block || !lineTk.span || !lineTk.span['=']) return

    const maxDoubleLen = lineTk.span['='].len
    if (maxDoubleLen < .5 * lineTk.contentLen) return

    return {
        type: 'doubleLine',
        line:  lineTk,
        level: lineTk.indent + 1,
    }
}

/*
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
*/

/*
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
*/

function parse(slice) {
    const flags  = {}
    const stream = lib.hyperframe.stream(slice)
    const nextLine = lib.hyperframe.lex.lines(stream)

    function parseFrame() {
        // handle subframe parsing with specialized preprocessor/lexer/parser pipelines
    }

    function doBlockHeader(doubleLineProd) {

        const frame = new dna.HyperFrame({
            at:     stream.cur(),
            level:  doubleLineProd.level,
            header: [],
            lines:  [],
            slice:  stream.slice,
        })

        // go over the source line by line 
        let line = nextLine()

        while (line !== undefined) {
            //log(`#${line.ln+1}:[${line.val}]`)

            const doubleLineProd = matchContiniousDoubleLine(line)

            if (doubleLineProd) break
            if (frame.header.length === 0 && line.contentLen > 0) frame.title = line.getContent()
            frame.header.push(line.val)

            line = nextLine()
        }

        return frame
    }

    function doFrame(level, title, nextFrame) {

        const frame = nextFrame || new dna.HyperFrame({
            at:     stream.cur(),
            level:  level,
            title:  title ?? '',
            header: [],
            lines:  [],
            slice:  stream.slice,
        })

        // go over the source line by line 
        let prev, line = nextLine()

        while (line !== undefined) {
            //log(`#${line.ln+1}:[${line.val}]`)

            const doubleLineProd = matchContiniousDoubleLine(line)

            if (doubleLineProd) {
                if (prev && prev.contentLen > 0) {
                    // looks like a top header
                    const headerTitle = prev.getContent()

                    if (doubleLineProd.level > level) {
                        const nextFrame = new dna.HyperFrame({
                            at:     prev.at,
                            level:  level,
                            title:  title ?? '',
                            lines:  [],
                        })
                        nextFrame.lines.push(prev.val)
                        nextFrame.lines.push(line.val)

                        const subFrame = doFrame(doubleLineProd.level, headerTitle, nextFrame)
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

                } else {
                    // block-header here!
                    if (doubleLineProd.level > level) {
                        // go deeper in
                        const nextFrame = doBlockHeader(doubleLineProd)
                        if (nextFrame) {
                            const subFrame = doFrame(nextFrame.level, nextFrame.title, nextFrame)
                            if (subFrame) frame.attach(subFrame)
                        }
                    } else {
                        // !!!!!!!!!!!!!!!!!!!!!!!!!
                        // TODO figure out the structure, so we don't have to copy!!!
                        // !!!!!!!!!!!!!!!!!!!!!!!!!
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
            } else {
                // TODO handle regular content
                frame.lines.push(line.val)
            }


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
                prev = line
            } else {
                prev = null
            }
            */
            console.dir(line)

            prev = line
            line = nextLine()
        }

        frame.til = stream.cur()
        frame.slice = new dna.SourceSlice({
            __:    stream.slice,
            start: frame.at,
            end:   frame.til,
        })
        frame.src = frame.slice.toString()
        return frame
    }

    const root = doFrame(0, name)
    //root.slice = slice
    //root.src   = slice.getSource()
    //root.totalLength = root.src.length

    return root
}
