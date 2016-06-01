import angular from 'angular'

angular.module('Skunk.auth', [])

.service('auth', class Auth {
  constructor(notify) {
    this.notify = notify
  }

  reauth() {
    window.location.pathname = '/auth/github'
    this.notify.warning('Reauthenticating...')
  }
})
