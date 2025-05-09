class SourceSlice {

    constructor(st) {
        augment(this, {
            start: 0,
            end:   0,
            src:   '',
            buf:   null,
        }, st)
    }

    toString() {
        return this.buf || (this.buf = this.src.substring(this.start, this.end))
    }

}
