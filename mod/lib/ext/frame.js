function frame(src, name, path) {
    log(`=== Parsing a frame @: ${path} ===`)

    return lib.frame.parse(src, name, path)
}
