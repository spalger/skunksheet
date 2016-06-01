import parseLinkHeader from 'parse-link-header'
import axios from 'axios'
import { format as formatUrl } from 'url'
import { get, omitBy, isNil } from 'lodash'

const cleanKeys = obj => omitBy(obj, isNil)
const secsFromNow = unixts => {
  const ms = (unixts * 1000)
  const remain = ms - Date.now()
  const sec = remain / 1000
  return sec.toFixed(2)
}

export const getIssues = async ({ app, page, etag }) => {
  app.log.debug('fetching page %d', page)

  const { data, status, headers } = await axios.request({
    method: 'GET',
    url: formatUrl({
      protocol: 'https:',
      hostname: 'api.github.com',
      pathname: `/repos/${app.config('repo.org')}/${app.config('repo.name')}/issues`,
      query: {
        page,
        per_page: 100,
        state: 'all',
        sort: 'updated',
        direction: 'asc',
      },
    }),
    headers: cleanKeys({
      'If-None-Match': etag,
      'User-Agent': 'hub-cap/skunksheet',
      Authorization: `token ${app.config('github.botAccountToken')}`,
    }),

    maxContentLength: Infinity,
    validateStatus: () => true,
  })

  app.log.debug(
`github rate limit:
  remaining: ${headers['x-ratelimit-remaining']}
  limit:     ${headers['x-ratelimit-limit']}
  reset in:  ${secsFromNow(headers['x-ratelimit-reset'])} seconds
`
  )

  if (status === 304) {
    return null
  }

  if (status === 200) {
    return {
      page,
      morePages: page < get(parseLinkHeader(headers.link), ['last', 'page'], page),
      etag: headers.etag,
      issues: data,
    }
  }

  throw new Error(
    `Unexpected response from Github: ${JSON.stringify({ status, headers, data }, null, '  ')}`
  )
}
