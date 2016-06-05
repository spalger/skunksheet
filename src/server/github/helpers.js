import { omitBy } from 'lodash'

export const stripExtraUrls = githubEntity =>
  omitBy(githubEntity, (k, key) => key.endsWith('_url'))
