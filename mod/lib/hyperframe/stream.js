// input stream created from a slice of the source
//
// @param {SourceSlice} slice
function stream(slice) {
    const src = slice.getSource()

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

    function lookAt(lineNum, linePos) {
        return slice.lookAt(lineNum, linePos)
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

    function rewind(shift) {
        if (shift < 0) throw new Error(`Can't rewind forward!`)
        const askPos = pos - shift
        if (askPos < slice.start) {
            throw new Error(`The rewind value [${shift}] is too high and goes beyond slice [${slice.start}:${slice.end}]`)
        }
        const newPos = this.seek(askPos)
        //const at = slice.lineCoordAt(newPos)
        return newPos
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

    function xerr(msg, errorPos) {
        // TODO should it be clamped over the slice or the whole source?
        errorPos = clamp(errorPos ?? pos, 0, src.length)

        // TODO make the context printout (LINES BEFORE & AFTER) environment-configurable
        const at     = slice.lineCoordAt(errorPos),
              lines1 = slice.extractLines(at.lineNum - 4, at.lineNum),
              lines2 = slice.extractLines(at.lineNum + 1, at.lineNum + 3)
              
        throw new Error(`[${slice.context()}:${at.lineNum+1}.${at.linePos+1}] ${msg}\n${lines1}\n`
            + `${lib.util.lpad('', at.linePos, '_')}^\n${lines2}`)
    }


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
        rewind,

        mark,
        restore,
        drop,
        eos,
        //expectc,
        //notc,
        
        xerr,
    }
}
