import angular from 'angular'
import 'angular-route'
import './Sheet'
import Horizon from '@horizon/client'

angular.module('ShunkApp', ['ngRoute', 'ShunkApp.Sheet'])

.service('horizon', () => new Horizon())

// setup routing
.config(($locationProvider, $routeProvider) => {
  $routeProvider
  .when('/', {
    template: '<shunk-sheet></shunk-sheet>',
  })
  .otherwise('/')
})
