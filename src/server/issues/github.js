import { get } from 'lodash'
import { getGithubApi } from '../github'

export const getIssues = async ({ app, page, etag }) => {
  const api = getGithubApi(app)

  app.log.debug('fetching page %d', page)
  return await api({
    app, access: app.getBotAccess(),

    pathname: `/repos/${app.config('repo.org')}/${app.config('repo.name')}/issues`,
    query: {
      page,
      per_page: 100,
      state: 'all',
      sort: 'updated',
      direction: 'asc',
    },
    etag,

    handlers: {
      304: () => null,

      200: ({ body, headers, link }) => ({
        page,
        morePages: page < get(link, ['last', 'page'], page),
        etag: headers.etag,
        issues: body,
      }),
    },
  })
}
