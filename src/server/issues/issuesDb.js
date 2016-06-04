import { logger } from '@horizon/server'
import r from 'rethinkdb'
import partial from 'lodash/partial'

import { getConnection, getConnectionToInternal } from '../db'

const getIssueTable = async config =>
  await r.table('collections')
    .get('issues')
    .bracket('table')
    .run(await getConnectionToInternal(config))


export const getSyncContext = async (conn, table) =>
  await r.table(table)
    .orderBy({ index: r.desc('updated_at') })
    .nth(0)
    .bracket('context')
    .default(null)
    .run(conn)


export const saveIssuesWithContext = async (conn, table, { context, issues }) => {
  logger.info(`saving issues with context ${JSON.stringify(context)}`)

  await r.table(table)
    .insert(issues.map(i => ({ ...i, context })), { conflict: 'replace' })
    .run(conn)
}

export const createDb = async (config) => {
  const [conn, table] = await Promise.all([
    getConnection(config),
    getIssueTable(config),
  ])

  return {
    getSyncContext: partial(getSyncContext, conn, table),
    saveIssuesWithContext: partial(saveIssuesWithContext, conn, table),
  }
}
