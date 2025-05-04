function parse(src) {
    const stream = lib.frame.stream(src)
    const lexer = lib.frame.lexer(stream)

    let line = lexer.nextLine()
    while (line !== undefined) {
        log(`::[${line}]`)
        line = lexer.nextLine()
    }
}
