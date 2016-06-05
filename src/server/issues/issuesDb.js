import { delay } from 'bluebird'
import { partial, flatten } from 'lodash'

import { getClient } from '../es'

const $$ = new WeakMap()

export const getSyncContext = async app => {
  const es = await getClient(app)
  const resp = await es.search({
    index: 'issues',
    type: 'issue',
    ignore: [404],
    body: {
      sort: [
        { updated_at: 'desc' },
      ],
      size: 1,
      _source: 'context.*',
    },
  })

  if (!resp.hits || !resp.hits.total) {
    return null
  }

  return resp.hits.hits[0]._source.context
}

export const saveIssuesWithContext = async (app, { context, issues }) => {
  app.log.info('saving %d issues with context %j', issues.length, context)

  const es = await getClient(app)
  const queue = issues.slice(0)
  let attempts = 0

  while (queue.length) {
    if (attempts >= 5) {
      throw new Error(
        `Tried to index events ${attempts} times and still have ${queue.length} unindexed documents`
      )
    }

    if (attempts > 0) {
      // wait a couple seconds, elasticsearch could be coming back
      await delay(2000)
    }

    attempts += 1
    const sent = queue.splice(0)
    const resp = await es.bulk({
      index: 'issues',
      body: flatten(sent.map(issue => [
        { index: { _id: issue.id, _type: issue.pull_request ? 'pull' : 'issue' } },
        { ...issue, context },
      ])),
    })

    if (resp.errors) {
      resp.items.forEach((item, i) => {
        if (!item.error) return
        app.log.warning('Unable to index update to document issues/issue/%s', item.id, item.error)
        queue.push(sent[i])
      })
    }
  }
}

export const createDb = async app => ({
  getSyncContext: partial(getSyncContext, app),
  saveIssuesWithContext: partial(saveIssuesWithContext, app),
})

export const getDb = async app => {
  if (!$$.has(app)) {
    $$.set(app, createDb(app))
  }

  return await $$.get(app)
}
