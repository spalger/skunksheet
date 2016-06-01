import { getClient } from '../es'

export async function getOrCreateUser(app, accessToken, refreshToken, profile) {
  const es = await getClient(app)

  const { id } = profile
  const userUpdates = {
    id,
    profile,
    accessToken,
    refreshToken,
  }

  const existing = await es.getSource({
    id,
    type: 'user',
    index: 'users',
    ignore: [404],
    _sourceExclude: [
      'id',
      'profile.*',
      'accessToken',
      'refreshToken',
    ],
  })

  const user = existing
    ? {
      ...existing,
      ...userUpdates,
    }
    : {
      ...userUpdates,
    }

  return await es.index({
    id,
    type: 'user',
    index: 'users',
    body: user,
  })
}
