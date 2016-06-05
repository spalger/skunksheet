import toml from 'toml'
import set from 'lodash/set'
import { readFileSync } from 'fs'

export const readConfigValsFromEnv = env =>
  Object
    .keys(env)
    .filter(key => key.startsWith('skunksheet_'))
    .map(key => [key.replace('skunksheet_', '').split('_').join('.'), process.env[key]])
    .reduce((vals, [key, val]) => set(vals, key, val), {})

export const readConfigValsFromFile = path =>
  toml.parse(readFileSync(path))
