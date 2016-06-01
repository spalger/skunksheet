import Joi from 'joi'
import { cloneDeep, get, memoize, set } from 'lodash'

import { configSchema } from './configSchema'
import { loadConfig } from './loadConfig'

export const createConfig = (filePath, env) => {
  const values = loadConfig(filePath, env)

  const getSchema = memoize(key => Joi.reach(configSchema, key || ''))

  const assert = key => {
    if (!getSchema(key)) {
      throw new TypeError(`Unknown config value ${key}`)
    }
  }

  const config = key => {
    assert(key)
    return cloneDeep(get(values, key))
  }

  config.set = (key, value) => {
    const { error, value: validated } = Joi.validate(value, getSchema(key), {
      presence: 'required',
      stripUnknown: true,
      allowUnknown: false,
      convert: true,
    })

    if (error) {
      throw new Error(JSON.stringify(error))
    }

    set(values, key, cloneDeep(validated))
  }

  config.has = key => {
    try {
      assert(key)
      return true
    } catch (err) {
      return false
    }
  }

  return config
}
