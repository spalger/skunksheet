import Joi from 'joi'
import { cloneDeep, get, isPlainObject, memoize, set } from 'lodash'

import { $$ } from '../utils'
import { configSchema } from './configSchema'
import { loadConfig } from './loadConfig'

export class Config {
  constructor(filePath, env) {
    $$.set(this, {
      values: {},
    })

    this.getSchema = memoize(this.getSchema.bind(this))
    this.set(loadConfig(filePath, env))

    const api = this.get.bind(this)
    api.set = this.set.bind(this)
    api.has = this.has.bind(this)

    return api
  }

  assert(key) {
    if (!this.getSchema(key)) {
      throw new TypeError(`Unknown config value ${key}`)
    }
  }

  getSchema(key) {
    return Joi.reach(configSchema, key || '')
  }

  has(key) {
    try {
      this.assert(key)
      return true
    } catch (err) {
      return false
    }
  }

  get(key) {
    if (key == null) {
      return cloneDeep($$(this).values)
    }

    this.assert(key)
    return cloneDeep(get($$(this).values, key))
  }

  set(key, value) {
    if (isPlainObject(key)) {
      $$(this).values = this.validate(configSchema, key)
    } else {
      const validated = this.validate(this.getSchema(key), value)
      set($$(this).values, key, cloneDeep(validated))
    }
  }

  validate(schema, value) {
    const { error, value: validated } = Joi.validate(value, schema, {
      presence: 'required',
      stripUnknown: true,
      allowUnknown: false,
      convert: true,
      abortEarly: false,
    })

    if (error) {
      throw new Error(

`Invalid server configuration:
${
  error.details.map(d => `
  ${d.path}
    ${d.message}
`
  ).join('')
}

  Received:
    ${JSON.stringify(error._object, null, '  ').split('\n').join('\n    ')}
`
      )
    }

    return validated
  }
}
