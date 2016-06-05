import { getLatestIssues } from './sync'

export async function setupIssueSync(app) {
  (async function doSync() {
    try {
      await getLatestIssues(app)
    } catch (err) {
      app.log.error('synchronization failed', err.stack)
    } finally {
      setTimeout(doSync, 5000)
    }
  }())
}
