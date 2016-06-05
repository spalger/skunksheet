
import { randomBytes } from 'crypto'
import { fromNode as fn } from 'bluebird'
import Boom from 'boom'

import { getAuthUrl, authCodeToAccessToken } from './oauth'
import { getAccessForGHAccessToken } from './access'

const getRandomString = async () =>
  (await fn(cb => randomBytes(16, cb))).toString('hex')

export const setupLogin = app => {
  app.route({
    path: '/auth/github',
    async handler(req, res) {
      const state = req.session.oauthState = await getRandomString()
      res.redirect(getAuthUrl(app, state))
    },
  })

  app.route({
    path: '/auth/github/callback',
    async handler(req, res) {
      const state = req.session.oauthState
      req.session = null

      if (state !== req.query.state) {
        app.log.debug('expected state of %j but got %j', state, req.query.state)
        throw Boom.unauthorized('invalid state param')
      }

      const token = await authCodeToAccessToken(app, req.query.code)
      const access = await getAccessForGHAccessToken(app, token)
      res.json(access)
    },
  })
}
