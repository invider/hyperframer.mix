function postSetup() {
    //const frames = $.find(e => e instanceof dna.HyperFrame)
    const frames = $.find(e => e instanceof dna.HyperFrame && !(e.__ instanceof dna.HyperFrame))
    const dir = {}
    frames.forEach(f => dir[f.name] = f)

    console.dir(frames)
    console.dir(dir.slides)
}
