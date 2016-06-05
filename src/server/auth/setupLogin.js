import { randomBytes } from 'crypto'
import { fromNode as fn } from 'bluebird'
import Boom from 'boom'

import { mapQueryString } from '../utils'
import { getAuthUrl, authCodeToAccessToken } from './oauth'
import { getAccessForGHAccessToken, getJwtForAccess } from './access'

const getRandomString = async () =>
  (await fn(cb => randomBytes(16, cb))).toString('hex')

export const setupLogin = app => {
  app.route({
    path: '/auth/github',
    async handler(req, res) {
      const redirectTo = req.query.redirectTo
      const state = await getRandomString()

      req.session.oauth = { state, redirectTo }
      res.redirect(getAuthUrl(app, state))
    },
  })

  app.route({
    path: '/auth/github/callback',
    async handler(req, res) {
      const { state, redirectTo = '/' } = req.session.oauth
      delete req.session.oauth

      if (state !== req.query.state) {
        app.log.debug('expected state of %j but got %j', state, req.query.state)
        throw Boom.unauthorized('invalid state param')
      }

      const token = await authCodeToAccessToken(app, req.query.code)
      const access = await getAccessForGHAccessToken(app, token)
      const newJwt = await getJwtForAccess(app, access)

      req.session = { newJwt }
      res.redirect(mapQueryString(redirectTo, query => ({
        ...query,
        auth: 'success',
      })))
    },
  })

  app.route({
    path: '/auth/jwt',
    handler(req, res) {
      if (req.get('Authorization') !== 'request') {
        throw Boom.unauthorized('Invalid Authorization')
      }

      if (!req.session.newJwt) {
        throw Boom.notFound('No JWT found')
      }

      const jwt = req.session.newJwt
      req.session = null
      res.type('text').send(jwt)
    },
  })
}
