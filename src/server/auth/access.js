import jsonwebtoken from 'jsonwebtoken'
import { Boom } from 'boom'
import { fromNode as fn } from 'bluebird'

import { getGithubApi, stripExtraUrls } from '../github'
import { getClient } from '../es'

export const createOrUpdateAccess = async (app, access) => {
  const es = getClient(app)

  const resp = await es.index({
    index: 'access',
    type: 'grant',
    id: access.user.id,
    body: {
      ...access,
      id: access.user.id,
    },
  })

  return resp._id
}

export const getJwtForAccess = async (app, access) => {
  const payload = {
    accessId: access.id,
    userLogin: access.user.login,
  }
  const secret = app.config('jwt.secret')
  const options = {
    audience: app.getUri(),
    issuer: app.config('jwt.issuer'),
  }
  return await fn(cb =>
    jsonwebtoken.sign(payload, secret, options, cb)
  )
}

export const getAccessFromJwt = async (app, jwt) => {
  throw Boom.notImplemented('getAccessFromJwt is not implemented yet')
}

export const getAccessForGHAccessToken = async (app, accessToken) => {
  const api = getGithubApi(app)

  const access = {
    github: {
      token: accessToken.access_token,
      tokenType: accessToken.token_type,
      scopes: accessToken.scope.split(/\s*,\s*/),
    },
  }

  const [user, orgs] = await Promise.all([
    api({
      access,
      pathname: '/user',
      expect: 200,
    }),
    api({
      access,
      pathname: '/user/orgs',
      expect: 200,
    }),
  ])

  access.user = stripExtraUrls(user)
  access.user.orgs = orgs.map(stripExtraUrls)
  access.id = await createOrUpdateAccess(app, access)

  app.log.debug('New access granted:', access)

  return access
}
