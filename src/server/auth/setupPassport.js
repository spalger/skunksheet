import passport from 'passport'
import { attempt } from 'bluebird'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'

import { getAccessFromJwt } from './access'

export const setupPassport = app => {
  passport.use(
    new JwtStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeader(),
      secretOrKey: app.config('jwt.secret'),
      issuer: app.config('jwt.issuer'),
      audience: app.getUri(),
    },
    (jwt, done) => {
      attempt(() => getAccessFromJwt(app, jwt)).nodeify(done)
    }
  ))

  app.express.use(passport.initialize())
  app.express.use('/api', passport.authenticate('jwt', { session: false }))
}
