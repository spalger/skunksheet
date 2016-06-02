/* eslint-disable no-underscore-dangle */
import { logger } from '@horizon/server'
import r from 'rethinkdb'
import { getConnectionToInternal } from './db'

export async function getOrCreateInHorizon(config, hzServer, accessToken, refreshToken, profile) {
  const auth = hzServer._auth

  // stolen from auth#generate()
  const key = auth.auth_key('github', profile.id)

  const insert = (table, row) =>
    r.table(table)
      .insert(row, { conflict: 'error', returnChanges: 'always' })
      .bracket('changes')(0)('new_val')

  let user
  try {
    user = await insert('users_auth', {
      id: key,
      user_id: r.uuid(),
      access_token: accessToken,
    })
    .do(authUser =>
      insert('users', {
        id: authUser('user_id'),
        groups: ['default', 'authenticated'],
        $hz_v$: 0,
        profile: profile._json,
      })
    )
    .run(await getConnectionToInternal(config))
  } catch (err) {
    // TODO: if we got a `Duplicate primary key` error, it was likely a race condition
    // and we should succeed if we try again.
    logger.error('Failed user lookup or creation:', err)
    throw new Error('User lookup or creation in database failed.')
  }

  return auth._jwt.sign({ id: user.id, provider: 'github' })
}
