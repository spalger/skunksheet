import axios from 'axios'
import { isArray } from 'lodash'
import { format as formatUrl } from 'url'
import parseLinkHeader from 'parse-link-header'

import { weakMemoize, secsFromNow } from '../utils'

export const getGithubApi = weakMemoize(app => {
  const { log } = app

  const assertAccess = access => {
    if (!access) throw new Error('missing access')
    if (!access.github || !access.github.token) {
      throw new Error('This access does not include github access')
    }
  }

  const logRateLimit = ({ rate }) => {
    log.debug(
  `github rate limit:
    remaining: ${rate.remaining}
    limit:     ${rate.limit}
    reset in:  ${secsFromNow(rate.reset)} seconds
  `
    )
  }

  return async function api({ access, method, pathname, query, etag, handlers, expect }) {
    assertAccess(access)

    const req = {
      method,
      url: formatUrl({
        protocol: 'https:',
        hostname: 'api.github.com',
        pathname: pathname || '/',
        query,
      }),

      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'hub-cap/skunksheet',
        Authorization: `token ${access.github.token}`,
      },

      timeout: 15000,
      responseType: 'json',
      maxRedirects: 3,
      maxContentLength: Infinity,
      validateStatus: () => true,
    }

    if (etag) {
      req.headers['If-None-Match'] = etag
    }

    const { data, headers, status } = await axios(req)

    if (expect) {
      if (expect === status) return data
      if (isArray(expect) && expect.includes(status)) return data
    }

    const resp = {
      body: data,
      headers,
      status,
      link: headers.link
        ? parseLinkHeader(headers.link)
        : {},
      rate: {
        remaining: headers['x-ratelimit-remaining'],
        limit: headers['x-ratelimit-limit'],
        reset: headers['x-ratelimit-reset'],
      },
    }

    logRateLimit(resp)

    if (!expect && !handlers) {
      return resp
    }

    if (handlers[status]) {
      return handlers[status]()
    }

    throw new Error(
  `
  Unexpected response from Github:
    Sent:
      ${method} => ${req.url}

    Received:
      status: ${status}
      headers: ${JSON.stringify(headers, null, '  ').split('\n').join('\n      ')}
      body: ${JSON.stringify(data, null, '  ').split('\n').join('\n      ')}
  `
    )
  }
})
