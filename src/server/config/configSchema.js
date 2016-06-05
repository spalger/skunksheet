import Joi from 'joi'
import { LOG_LEVELS } from '../log'

export const configSchema = Joi
  .object()
  .keys({
    es: Joi.object().keys({
      uri: Joi.string().uri(),
    }),

    server: Joi.object().keys({
      hostname: Joi.string().hostname().default('localhost'),
      port: Joi.number(),
      secure: Joi.boolean().default(true),
      keyFile: Joi.when('secure', {
        is: true,
        then: Joi.string(),
        otherwise: Joi.any().forbidden(),
      }),
      certFile: Joi.when('secure', {
        is: true,
        then: Joi.string(),
        otherwise: Joi.any().forbidden(),
      }),
    }),

    logging: Joi.object().keys({
      level: Joi.valid(LOG_LEVELS).default('info'),
    }),

    repo: Joi.object().keys({
      org: Joi.string(),
      name: Joi.string(),
    }),

    session: Joi.object().keys({
      secret: Joi.string(),
    }),

    jwt: Joi.object().keys({
      secret: Joi.string(),
      issuer: Joi.string().default('skunksheet'),
    }),

    github: Joi.object().keys({
      appId: Joi.string(),
      appSecret: Joi.string(),
      botAccountToken: Joi.string(),
      callbackPath: Joi.string(),
    }),
  })
