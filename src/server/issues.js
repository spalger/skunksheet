import r from 'rethinkdb'
import { get, omitBy, isNil } from 'lodash'
import { logger } from '@horizon/server'
import { format as formatUrl } from 'url'
import axios from 'axios'
import parseLinkHeader from 'parse-link-header'

import { getConnection, getConnectionToInternal } from './db'

export async function getLatestIssue(config) {
  const interConn = await getConnectionToInternal(config)
  const conn = await getConnection(config)

  const table = await r.table('collections')
    .get('issues')
    .getField('table')
    .run(interConn)

  const lastContext = (
    await r.table(table)
    .orderBy(r.desc('updated_at'))
    .limit(1)
    .getField('q_context')
    .default(null)
    .run(conn)
  ).pop() || {}

  let page = lastContext.page ? lastContext.page - 1 : 0
  let lastPage = page

  while (page <= lastPage) {
    page += 1
    logger.debug('fetching page %d', page)

    const { data, status, headers } = await axios.request({
      method: 'GET',
      url: formatUrl({
        protocol: 'https:',
        hostname: 'api.github.com',
        pathname: '/repos/elastic/cloud/issues',
        query: omitBy({
          page,
          per_page: 100,
          state: 'all',
          sort: 'updated',
        }, isNil),
      }),
      maxContentLength: Infinity,
      validateStatus: s => [304, 200].includes(s),
      headers: omitBy({
        'If-None-Match': lastContext.etag,
        'User-Agent': 'hub-cap/skunksheet',
        Authorization: `token ${process.env.SERVER_GITHUB_ACCOUNT_TOKEN}`,
      }, isNil),
    })

    if (status === 304) {
      logger.debug('304 not modified')
      return
    }

    logger.info('saving page', page)
    lastPage = get(parseLinkHeader(headers.link), 'last.page', -1)
    const etag = headers.etag

    await r.table(table)
      .insert(data.map(i => ({
        q_context: { page, etag },
        ...i,
      })), { conflict: 'replace' })
      .run(conn)
  }
}
