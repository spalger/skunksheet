import merge from 'lodash/merge'

import { readConfigValsFromEnv, readConfigValsFromFile } from './readConfigVals'

export const loadConfig = (filePath, env) => {
  const fromFile = readConfigValsFromFile(filePath)
  const fromEnv = readConfigValsFromEnv(env)
  return merge({}, fromFile, fromEnv)
}
