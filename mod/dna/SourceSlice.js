class SourceSlice {

    constructor(st) {
        if (isStr(st)) {
            // the root slice
            extend(this, {
                __:    null,
                start: 0,
                end:   st.length,
                src:   st,
                buf:   null,
            })
        } else {
            extend(this, {
                __:    null,
                start: 0,
                end:   0,
                buf:   null,
            }, st)
            if (!this.src && this.__) this.src = this.__.getSource()
            if (!this.src) throw new Error('Slice source is missing!')
        }

        if (!this.__) this.indexLines()
        else this.defineLineRange()

        if (env.config.debugSlices) {
            this.buf = this.src.substring(this.start, this.end)
        }
    }

    indexLines() {
        const src = this.src,
              linePos = [],
              lineEnd = []

        let i = 0
        if (src.length > 0) linePos.push(0)
        while(i < src.length) {
            const code = src.charCodeAt(i++)
            if (code === 0x0D || code === 0x0A) {
                // detected a new line
                lineEnd.push(i - 2)
                if (code === 0x0D && src.charCodeAt(i) === 0x0A) i++
                if (i < src.length) linePos.push(i)
            }
        }
        if (linePos.length > lineEnd.length) lineEnd.push(src.length - 1)

        this.linePos   = linePos
        this.lineEnd   = lineEnd
        // buffer line reference values
        this.lines     = this.linePos.length
        this.startLine = 0
        this.endLine   = this.lines - 1
    }

    defineLineRange() {
        this.startLine = this.lineNumberAt(this.start)
        this.endLine   = this.lineNumberAt(this.end - 1)
    }

    clone() {
        return new dna.SourceSlice(this)
    }

    join(followingSlice) {
        if (!isObj(followingSlice) || !(followingSlice instanceof dna.SourceSlice)) throw new Error(`Expecting a SourceSlice for join`)
        if (followingSlice.src !== this.src) throw new Error(`The joining slice source MUST be the same as this slice source!`)
        if (followingSlice.start !== this.end) {
            throw new Error(
                `The joining slice MUST follow this one! Expected to start @${this.end}, but @${followingSlice.start} found instead!`)
        }
        this.end = followingSlice.end
        this.buf = null // MUST clear the cache!
    }

    joinAll(followingSlices) {
        followingSlices.forEach(slice => this.join(slice))
    }

    range(start, end) {
        start = clamp(start, this.start, this.end)
        end   = clamp(end,   this.start, this.end)
        return this.src.substring(start, end)
    }

    subSlice(start, end) {
        start = clamp(start, this.start, this.end)
        end   = clamp(end,   this.start, this.end)
        return new dna.SourceSlice({
            __:    this,
            src:   this.src,
            start: start,
            end:   end,
        })
    }

    lineNumberAt(pos) {
        if (this.__) return this.__.lineNumberAt(pos)

        for (let i = 1; i < this.linePos.length; i++) {
            const mark = this.linePos[i]
            if (pos < mark) return i - 1
        }
        if (pos < this.src.length) return this.linePos.length - 1

        return -1
    }

    lineCoordAt(pos) {
        if (this.__) return this.__.lineCoordAt(pos)

        const linePos = this.linePos
        for (let i = 1; i < linePos.length; i++) {
            const mark = linePos[i]
            if (pos < mark) return {
                lineNum: i - 1,
                linePos: pos - linePos[i - 1],
            }
        }
        if (pos < this.src.length) return {
            lineNum: linePos.length - 1,
            linePos: pos - linePos[linePos.length - 1],
        }

        return
    }

    lineLength(lineNum) {
        if (this.__) return this.__.lineLength(lineNum)

        if (lineNum < 0 || lineNum >= this.linePos.length) return -1
        if (lineNum === this.linePos.length - 1) {
            return this.src.length - this.linePos[lineNum]
        } else {
            return this.linePos[lineNum+1] - this.linePos[lineNum]
        }
    }

    lookAt(lineNum, linePos) {
        if (this.__) return this.__.lookAt(lineNum, linePos)

        if (lineNum < 0
                || lineNum >= this.linePos.length
                || linePos < 0
                || linePos >= this.lineLength(lineNum)) {
            return
        }
        return this.src.charAt(this.linePos[lineNum] + linePos)
    }

    // character at the slice-relative position
    charAt(lpos) {
        const pos = this.start + lpos
        if (pos < this.start || pos >= this.end) return
        return this.src.charAt(pos)
    }

    // character code at the slice-relative position
    charCodeAt(lpos) {
        const pos = this.start + lpos
        if (pos < this.start || pos >= this.end) return -1
        return this.src.charCodeAt(pos)
    }

    extractLine(ln) {
        if (this.__) return this.__.extractLine(ln)
        if (ln < 0 || ln >= this.linePos.length) return

        return this.src.substring(
                   this.linePos[ln],
                   this.lineEnd[ln] + 1
               )
    }

    extractLines(from, to) {
        if (this.__) return this.__.extractLines(from, to)

        const buf = []
        for (let ln = from; ln <= to; ln++) {
            const line = this.extractLine(ln) 
            if (line !== undefined) buf.push(line)
        }
        return buf.join('\n')
    }

    context() {
        if (this.__) return this.__.context()
        return this.name || 'unknown'
    }

    getSource() {
        return this.src
    }

    getLength() {
        return this.end - this.start
    }

    toString() {
        return this.buf || (this.buf = this.src.substring(this.start, this.end))
    }

}
