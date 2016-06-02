import r from 'rethinkdb'
import { get } from 'lodash'
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

  const lastUpdate = (
    await r.table(table)
    .orderBy(r.desc('updated_at'))
    .limit(1)
    .pluck('updated_at', 'etag')
    .default(null)
    .run(conn)
  ).pop()

  let lastPage = 0
  let page = 0
  while (page <= lastPage) {
    page += 1
    logger.debug('fetching page %d', page)

    const { data, status, headers } = await axios.request({
      method: 'GET',
      url: formatUrl({
        protocol: 'https:',
        hostname: 'api.github.com',
        pathname: '/repos/elastic/cloud/issues',
        query: {
          page,
          per_page: 100,
          state: 'all',
          sort: 'updated',
          since: lastUpdate.updated_at,
        },
      }),
      maxContentLength: Infinity,
      validateStatus: s => [304, 200].includes(s),
      headers: {
        'If-None-Match': lastUpdate.etag,
        'User-Agent': 'hub-cap/skunksheet',
        Authorization: `token ${process.env.SERVER_GITHUB_ACCOUNT_TOKEN}`,
      },
    })

    if (status === 304) {
      logger.debug('304 not modified')
      return
    }

    logger.info('saving page', page)
    lastPage = get(parseLinkHeader(headers.link), 'last.page', -1)
    const etag = headers.etag
    await r.table(table)
      .insert(data.map(i => ({ etag, ...i })), { conflict: 'replace' })
      .run(conn)
  }
}
