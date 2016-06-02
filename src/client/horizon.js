import angular from 'angular'
import Horizon from '@horizon/client'

angular.module('Skunk.horizon', [])

.factory('horizonSetup', $location => {
  const horizon = new Horizon({ secure: true, authType: 'token' })
  const { authOutcome } = $location.search()

  // auth success
  if (authOutcome === 'success') {
    horizon.utensils.tokenStorage.set($location.search().token)
    $location.search({}).replace()
    horizon.connect()
    return { ok: true, horizon }
  }

  // auth failure of some sort
  if (authOutcome) {
    Horizon.clearAuthTokens()
    return { ok: false, info: $location.search().info, horizon }
  }

  // we need to get authenticated
  if (!horizon.hasAuthToken()) {
    window.location.pathname = '/auth/github'
    return { ok: false, info: 'redirecting' }
  }

  // already authenticated
  return { ok: true, horizon }
})

.service('horizon', horizonSetup => horizonSetup.horizon)

// tie rxjs observables into angular
.decorator('$rootScope', ($delegate) => {
  /* eslint-disable no-param-reassign */
  $delegate.constructor.prototype.$sub = function $sub($, onResult, onError, onDone) {
    const $applied = (...fns) => {
      fns = fns.filter(Boolean)
      if (!fns.length) return undefined

      return (...args) => {
        this.$apply(() => {
          for (const fn of fns) {
            fn(...args)
          }
        })
      }
    }

    let cancelCleanup

    const sub = $.subscribe(
      $applied(onResult),
      $applied(onError),
      $applied(
        () => {
          cancelCleanup()
          cancelCleanup = null
        },
        onDone
      )
    )

    cancelCleanup = this.$on('$destroy', () => sub.unsubscribe())
  }
  /* eslint-enable no-param-reassign */

  return $delegate
})
