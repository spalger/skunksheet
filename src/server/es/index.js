import { Client } from 'elasticsearch'

import { weakMemoize } from '../utils'

export const getClient = weakMemoize(app => new Client({
  host: app.config('es.uri'),
}))
