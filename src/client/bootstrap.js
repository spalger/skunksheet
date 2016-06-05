import angular from 'angular'
import 'angular-route'
import './App'
import './Sheet'

angular.module('Skunk', ['ngRoute', 'Skunk.sheet', 'Skunk.app'])

// setup routing
.config(($locationProvider, $routeProvider) => {
  $locationProvider.html5Mode(true)

  $routeProvider
  .when('/', {
    template: '<skunk-sheet></skunk-sheet>',
  })
  .otherwise('/')
})

angular.bootstrap(
  angular.element(document.body).append('<skunk-app>'),
  ['Skunk']
)
