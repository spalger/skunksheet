import { logger } from '@horizon/server'

import { createDb } from './issuesDb'
import { getIssues } from './github'

export const saveRespAndProceed = async ({ db, resp }) => {
  const { page, morePages, etag, issues } = resp

  const context = { page, morePages, etag }
  await db.saveIssuesWithContext({ issues, context })

  if (morePages) {
    await getPageAndProceed({ db, page: page + 1 }) // eslint-disable-line no-use-before-define
  }
}

export const getPageAndProceed = async ({ db, page }) => {
  const resp = await getIssues({ db, page })
  await saveRespAndProceed({ db, resp })
}

export const restartFromPreviousContext = async ({ db, context }) => {
  const { page, morePages, etag } = context

  const resp = await getIssues({ page, etag })
  if (resp) {
    // the page was updated, so save and proceed
    await saveRespAndProceed({ db, resp })
    return
  }

  logger.debug(`no updates for issues page ${page} with etag ${etag}`)
  if (morePages) {
    // the page wasn't updated, but there are more pages we don't have yet
    await getPageAndProceed({ db, page: page + 1 })
    return
  }
}

export async function getLatestIssues(config) {
  const db = await createDb(config)
  const context = await db.getSyncContext()

  if (context) {
    await restartFromPreviousContext({ db, context })
    return
  }

  await getPageAndProceed({ db, page: 1 })
}
