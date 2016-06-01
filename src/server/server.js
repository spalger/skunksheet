import 'dotenv/config'

import { resolve } from 'path'
import { attempt } from 'bluebird'

import { App } from './app'
import { setupSessions } from './sessions'
import { setupPassport } from './auth'
import { setupIssueSync } from './issues'

process.chdir(resolve(__dirname, '../../'))

attempt(async function main() {
  const app = new App()

  setupSessions(app)
  setupPassport(app)
  setupIssueSync(app)

  app.express.listen(8181)
  app.log.info('listening on port 8181')
})
.done()
