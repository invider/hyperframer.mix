// TODO move to collider.jam text routines along with rpad() and hex/dec functions?
function lpad(s, N, ch) {
    ch = ch ?? ' '
    const n = N - s.length
    for (let i = 0; i < n; i++) {
        s = ch + s
    }
    return s
}

