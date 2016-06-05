import { cloneDeep, get, has, merge, set } from 'lodash'
import { dirname, resolve } from 'path'

import { readConfigValsFromEnv, readConfigValsFromFile } from './readConfigVals'

const paths = [
  'server.keyFile',
  'server.certFile',
]

const resolvePaths = (config, from) => {
  const resolved = cloneDeep(config)

  paths.forEach(p => {
    if (has(resolved, p)) {
      set(resolved, p, resolve(from, get(resolved, p)))
    }
  })

  return resolved
}

export const loadConfig = (filePath, env) => {
  const fromFile = resolvePaths(readConfigValsFromFile(filePath), dirname(filePath))
  const fromEnv = resolvePaths(readConfigValsFromEnv(env), process.cwd())
  return merge({}, fromFile, fromEnv)
}
