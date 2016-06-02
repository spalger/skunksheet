import angular from 'angular'
import 'angular-route'
import Horizon from '@horizon/client'
import './app'
import './sheet'

Horizon.enableLogging()

angular.module('Skunk', ['ngRoute', 'Skunk.sheet', 'Skunk.app', 'Skunk.horizon'])

// setup routing
.config(($locationProvider, $routeProvider) => {
  $locationProvider.html5Mode(true)

  $routeProvider
  .when('/', {
    template: '<skunk-sheet></skunk-sheet>',
    resolve: {
      horizon(horizonSetup, $location) {
        if (horizonSetup.ok) {
          return horizonSetup.horizon
        }

        if (horizonSetup.info === 'reauth') {
          return new Promise(() => {}) // don't resolve, this so that the redirect can take place
        }

        $location.path('/login-failure')
        return undefined
      },
    },
  })
  .when('/login-failure', {
    template: `
      <h1>Not authorized</h1>
      <p>Or maybe shit's just broken</p>
      <pre>{fail.info}</pre>
    `,
    resolve: {
      info(horizonSetup, $location) {
        if (!horizonSetup.info) {
          $location.path('/')
        }
      },
    },
    controllerAs: 'fail',
    controller($scope, horizonSetup) {
      this.info = horizonSetup.info
    },
  })
  .otherwise('/')
})

angular.bootstrap(angular.element(document.body).append('<skunk-app>'), ['Skunk'])
