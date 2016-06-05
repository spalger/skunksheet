import { memoize, pick } from 'lodash'
import { parse as parseUrl, format as formatUrl } from 'url'

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

export const mapQueryString = (url, block) => {
  const parsed = pick(parseUrl(url, true), 'protocol', 'host', 'pathname', 'query', 'hash')
  return formatUrl({
    ...parsed,
    query: block(parsed.query || {}) || parsed.query,
  })
}
