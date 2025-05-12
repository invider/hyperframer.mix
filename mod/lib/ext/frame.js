function frame(src, name, path) {
    log(`=== Parsing a frame @: ${path} ===`)

    const slice = new dna.SourceSlice(src)
    slice.name = name
    slice.path = path

    const rootFrame = lib.hyperframe.parse(slice)
    rootFrame.name  = name
    rootFrame.path  = path

    return rootFrame
}
