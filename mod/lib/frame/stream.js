function stream(sliceOrSource, name, path) {
    const slice = isStr(sliceOrSource)? new dna.SourceSlice(sliceOrSource) : sliceOrSource
    const src   = slice.getSource()

    if (isStr(name)) slice.name = name
    if (isStr(path)) slice.path = path

    let pos = slice.start

    const marks = []

    // return current stream position
    function cur() {
        return pos
    }

    function sliceAt() {
        return pos - slice.start
    }

    // get current character from the stream
    function getc() {
        if (pos < slice.start || pos > slice.end) return
        return src.charAt(pos++)
    }

    // return a character back to the stream (decrement position)
    function retc() {
        if (pos <= slice.start) throw new Error('Nothing to return!')
        pos --
    }

    // return the character ahead - the next that is going to be returned by getc()
    function aheadc() {
        if (pos < slice.start || pos > slice.end) return
        return src.charAt(pos)
    }

    function lookAhead(n) {
        const next = pos + n - 1
        if (next < slice.start || next > slice.end) return
        return src.charAt(next)
    }

    // skip the next character on the stream
    function skipc() {
        pos ++
    }

    // eat all following instances of the provided character from the input stream, return how many has been eaten
    function eatc(c) {
        let i = 0
        while(getc() === c) i++
        retc()
        return i
    }

    function seek(at) {
        pos = clamp(at, slice.start, slice.end)
        return pos
    }

    function mark() {
        marks.push(pos)
    }

    function restore() {
        if (marks.length === 0) throw new Error("Can't restore - marks stack is empty!")
        pos = marks.pop()
    }

    function drop() {
        if (marks.length === 0) throw new Error("Can't drop - marks stack is empty!")
        marks.pop()
    }

    function eos() {
        return (pos > slice.end)
    }

    /*
    // expect the provided character to be next and eat it from the stream, throw an error otherwise
    function expectc(c) {
        if (aheadc() !== c) throw new Error(`[${c}] is expected!`)
        getc()
    }

    // get the next character in the stream and make sure it is not the provided one
    function notc(c) {
        if (aheadc() === c) throw new Error(`[${c}] is not expected here!`)
        return getc()
    }
    */

    return {
        src,
        slice,

        cur,
        getc,
        retc,
        aheadc,
        lookAhead,
        skipc,
        eatc,
        seek,
        mark,
        restore,
        drop,
        eos,
        //expectc,
        //notc,
    }
}
