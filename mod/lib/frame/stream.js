function stream(src) {
    let pos = 0

    // return current stream position
    function cur() {
        return pos
    }

    // get current character from the stream
    function getc() {
        return src.charAt(pos++)
    }

    // return a character back to the stream (decrement position)
    function retc() {
        if (pos === 0) throw new Error('Nothing to return!')
        pos --
    }

    // return the character ahead - the next that is going to be returned by getc()
    function aheadc() {
        return src.charAt(pos)
    }

    function lookAhead(n) {
        return src.charAt(pos + n - 1)
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

    function eos() {
        return (pos >= src.length)
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
        cur,
        getc,
        retc,
        aheadc,
        lookAhead,
        skipc,
        eatc,
        eos,
        //expectc,
        //notc,
    }
}
