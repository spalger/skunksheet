import 'dotenv/config'

import { resolve } from 'path'
import { attempt } from 'bluebird'

import { App } from './app'
import { setupLogin, setupPassport } from './auth'
import { setupSessions } from './sessions'
// import { setupIssueSync } from './issues'
import { setupHttp } from './http'
import { setupViews } from './views'

const configPath = resolve('config.toml')
process.chdir(resolve(__dirname, '../'))

attempt(async function main() {
  const app = new App(configPath)

  setupSessions(app)
  setupLogin(app) // this has to go after sessions
  setupViews(app)
  setupPassport(app)
  // setupIssueSync(app)

  await setupHttp(app)
})
.done()
