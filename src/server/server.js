import 'dotenv/config'

import { resolve } from 'path'
import { attempt } from 'bluebird'

import { App } from './app'
import { setupLogin, setupPassport } from './auth'
import { setupSessions } from './sessions'
// import { setupIssueSync } from './issues'
import { setupAssets } from './assets'
import { setupHttp } from './http'

const configPath = resolve('config.toml')
process.chdir(resolve(__dirname, '../'))

attempt(async function main() {
  const app = new App(configPath)

  setupSessions(app)
  setupLogin(app)
  setupPassport(app)
  // setupIssueSync(app)
  setupAssets(app)

  await setupHttp(app)
})
.done()
