import { getDb } from './issuesDb'
import { getIssues } from './github'

export const saveRespAndProceed = async ({ app, resp }) => {
  const db = await getDb(app)

  const { page, morePages, etag, issues } = resp
  const context = { page, morePages, etag }
  await db.saveIssuesWithContext({ issues, context })

  if (morePages) {
    await getPageAndProceed({ app, page: page + 1 }) // eslint-disable-line no-use-before-define
  }
}

export const getPageAndProceed = async ({ app, page }) => {
  const resp = await getIssues({ app, page })
  await saveRespAndProceed({ app, resp })
}

export const restartFromPreviousContext = async ({ app, context }) => {
  app.log.debug('synchronizing from previous context: %j', context)
  const { page, morePages, etag } = context

  const resp = await getIssues({ app, page, etag })
  if (resp) {
    // the page was updated, so save and proceed
    await saveRespAndProceed({ app, resp })
    return
  }

  app.log.debug('no updates for issues page %d with etag %s', page, etag)
  if (morePages) {
    // the page wasn't updated, but there are more pages we don't have yet
    await getPageAndProceed({ app, page: page + 1 })
    return
  }
}

export const getLatestIssues = async app => {
  const db = await getDb(app)

  const context = await db.getSyncContext()
  if (context) {
    await restartFromPreviousContext({ app, context })
    return
  }

  await getPageAndProceed({ app, page: 1 })
}
