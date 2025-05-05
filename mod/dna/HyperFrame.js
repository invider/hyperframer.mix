
let id = 0

class HyperFrame extends sys.LabFrame {

    constructor(st) {
        super( augment({
            id:   ++id,
            tags: [],
            src:  '',
        }, st) )
    }

}
