import { parse as parseQueryString } from 'querystring'
import SimpleOauth2 from 'simple-oauth2'

import { weakMemoize } from '../utils'

const getRedirectUri = app => app.getUri({
  pathname: '/auth/github/callback',
})

const getOauth2 = weakMemoize(app => new SimpleOauth2({
  clientID: app.config('github.appId'),
  clientSecret: app.config('github.appSecret'),
  site: 'https://github.com/login',
  tokenPath: '/oauth/access_token',
  authorizationPath: '/oauth/authorize',
}))

export const getAuthUrl = (app, state) => {
  const oauth2 = getOauth2(app)
  return oauth2.authCode.authorizeURL({
    redirect_uri: getRedirectUri(app),
    scope: 'repo, user:email, read:org',
    state,
  })
}

export const authCodeToAccessToken = async (app, code) => {
  const oauth2 = getOauth2(app)
  return parseQueryString(await oauth2.authCode.getToken({
    code, redirect_uri: getRedirectUri(app),
  }))
}
