function recursiveTransform(o, fn) {
  const wrap = makeWrap(fn)
  return wrap(o, () => {})
}
function makeWrap(fn) {
  const memo = new Map()
  return function wrap(o, cont) {
    if (!memo.has(o)) { memo.set(o, []) }
    memo.get(o).push(cont)
    if (memo.get(o).length !== 1) {
      return
    }

    const result = fn(o, wrap)

    while (memo.get(o).length !== 0) {
      const cont = memo.get(o).pop()
      cont(result)
    }
    return result
  }
}

exports.recursiveTransform = recursiveTransform
