function parse(src) {
    const stream = lib.frame.stream(src)
    const lexer = lib.frame.lexer(stream)

    let pos = stream.cur()
    let line = lexer.nextLine()

    while (line !== undefined) {
        log(`#${lexer.curLine()}:[${line}]`)

        if (line.includes('dance')) {
            lexer.xerr("I don't like dancing!", pos)
        }

        pos  = stream.cur()
        line = lexer.nextLine()
    }
}
