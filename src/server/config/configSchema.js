import Joi from 'joi'
import { LOG_LEVELS } from '../log'

export const configSchema = Joi
  .object().keys({
    es: Joi.object().keys({
      uri: Joi.string().uri(),
    }),

    server: Joi.object().keys({
      hostname: Joi.string().hostname().default('localhost'),
      port: Joi.number(),
      secure: Joi.boolean().default(true),
      keyFile: Joi.string(),
      certFile: Joi.string(),
    }),

    logging: Joi.object().keys({
      level: Joi.valid(LOG_LEVELS).default('info'),
    }),

    repo: Joi.object().keys({
      org: Joi.string(),
      name: Joi.string(),
    }),

    sessions: Joi.object().keys({
      secret: Joi.string(),
    }),

    github: Joi.object().keys({
      appId: Joi.string(),
      appSecret: Joi.string(),
      botAccountToken: Joi.string(),
      callbackUrl: Joi.string(),
    }),
  })
