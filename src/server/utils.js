import memoize from 'lodash/memoize'

export const weakMemoize = fn => {
  const memoized = memoize(fn)
  memoized.cache = new WeakMap()
  return memoized
}

const $$store = new WeakMap()
export const $$ = (obj) => $$store.get(obj)
$$.set = (obj, val) => $$store.set(obj, val)

export const secsFromNow = unixts => {
  const ms = (unixts * 1000)
  const remain = ms - Date.now()
  const sec = remain / 1000
  return sec.toFixed(2)
}
