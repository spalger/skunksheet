import angular from 'angular'
import 'angular-route'
import './Sheet'

angular.module('ShunkApp', ['ngRoute', 'ShunkApp.Sheet'])

// setup routing
.config(($locationProvider, $routeProvider) => {
  $routeProvider
  .when('/', {
    template: '<shunk-sheet></shunk-sheet>',
  })
  .otherwise('/')
})
