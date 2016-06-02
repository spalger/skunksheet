import { once } from 'lodash'
import r from 'rethinkdb'

export const getConnectionToInternal = once(config => r.connect({
  host: config.rdb_host,
  port: config.rdb_port,
  db: `${config.project_name}_internal`,
}))

export const getConnection = once(config => r.connect({
  host: config.rdb_host,
  port: config.rdb_port,
  db: config.project_name,
}))
