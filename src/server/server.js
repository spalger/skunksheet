import 'dotenv/config'
import express from 'express'
import Horizon, { logger } from '@horizon/server'
import hzServe from 'horizon/src/serve'
import https from 'https'
import http from 'http'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { attempt } from 'bluebird'
import { defaultsDeep } from 'lodash'
import passport from 'passport'
import GitHubStrategy from 'passport-github2'

import { getOrCreateInHorizon } from './auth'
import { getLatestIssues } from './issues'

if (process.argv.some(a => a === '--debug')) {
  logger.level = 'debug'
}

function createServer(rel, config) {
  if (config.cert_file) {
    return https.createServer({
      cert: readFileSync(rel(config.cert_file)),
      key: readFileSync(rel(config.key_file)),
    })
  }

  return http.createServer()
}

function readConfig(rel) {
  const file = hzServe.read_config_from_file(null, rel('.hz/config.toml'))
  const env = hzServe.read_config_from_env()
  return defaultsDeep({}, env, file)
}

attempt(async function main() {
  const rel = resolve.bind(null, __dirname, '../../')
  const config = readConfig(rel)
  logger.debug('loaded config:', config)

  const app = express()

  // github oauth
  passport.use(
    new GitHubStrategy({
      clientID: process.env.GITHUB_APP_ID,
      clientSecret: process.env.GITHUB_APP_SECRET,
      callbackURL: 'https://localhost:8181/auth/github/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      attempt(() =>
        getOrCreateInHorizon(
          config,
          hzServer, // eslint-disable-line no-use-before-define
          accessToken,
          refreshToken,
          profile
        )
      ).nodeify(done)
    }
  ))

  app.use(passport.initialize())

  app.get('/auth/github', passport.authenticate('github', {
    scope: 'repo',
    session: false,
  }))

  app.get('/auth/github/callback', (req, res, next) => {
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

  // serve the client bundle output
  app.use(express.static(rel(config.serve_static)))

  // enable "html5" style routing
  app.use((req, res, next) => {
    if (req.url.match(/^\/(auth|horizon)\//)) {
      logger.debug('ignoring request for', req.url)
      next()
    } else {
      logger.debug('sending index.html')
      res.sendFile(rel(config.serve_static, 'index.html'))
    }
  })

  const server = createServer(rel, config)
    .on('request', app)
    .listen(8181)

  const hzServer = new Horizon.Server(server, {
    auto_create_collection: config.auto_create_collection,
    auto_create_index: config.auto_create_index,
    permissions: config.permissions,
    rdb_host: config.rdb_host,
    rdb_port: config.rdb_port,
    project_name: config.project_name,
    auth: {
      token_secret: config.token_secret,
      allow_unauthenticated: config.allow_unauthenticated,
      allow_anonymous: config.allow_anonymous,
      success_redirect: config.auth_redirect,
      failure_redirect: config.auth_redirect,
    },
  })

  await hzServer.ready()
  logger.info('listening on port 8181\n')

  attempt(async function sync() {
    try {
      logger.debug('synchronizing issues')
      await getLatestIssues(config)
    } catch (err) {
      logger.error('synchronization failed', err)
    } finally {
      setTimeout(sync, 5000)
    }
  })
})
.done()
