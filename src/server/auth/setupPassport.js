import passport from 'passport'
import GitHubStrategy from 'passport-github2'
import { attempt } from 'bluebird'
import { format as urlFormat } from 'url'

import { getOrCreateUser } from '../users'

export const setupPassport = app => {
  const { config } = app
  // github oauth
  passport.use(
    new GitHubStrategy({
      clientID: config('github.appId'),
      clientSecret: config('github.appSecret'),
      callbackURL: urlFormat({
        protocol: config('server.secure') ? 'https:' : 'http:',
        hostname: config('server.hostname'),
        port: config('server.port'),
        path: config('github.callbackUrl'),
      }),
    },
    (accessToken, refreshToken, profile, done) => {
      attempt(() => getOrCreateUser(app, accessToken, refreshToken, profile)).nodeify(done)
    }
  ))

  app.express.use(passport.initialize())

  app.express.get('/auth/github', passport.authenticate('github', {
    scope: 'repo',
    session: false,
  }))

  app.express.get('/auth/github/callback', (req, res, next) => {
    passport.authenticate('github', (err, user, info) => {
      if (err || !user) {
        res.redirect(`/?authOutcome=error&info=${encodeURIComponent(err.message)}`)
        return
      }

      if (!user) {
        res.redirect(`/?authOutcome=failure&info=${encodeURIComponent(JSON.stringify(info))}`)
        return
      }

      res.redirect(`/?authOutcome=success&token=${encodeURIComponent(user.token)}`)
    })(req, res, next)
  })
}
