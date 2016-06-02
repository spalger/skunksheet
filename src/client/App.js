import angular from 'angular'
import 'angular-route'
import './sheet'

angular.module('Skunk.app', ['ngRoute', 'Skunk.sheet'])

.component('skunkApp', {
  template: `
    <p>Hi, {{ skunk.user.profile.login }}</p>
    <ng-view></ng-view>
  `,
  controllerAs: 'skunk',
  controller: class SkunkController {
    constructor($scope, horizon) {
      $scope.$sub(horizon.currentUser().watch(), user => {
        this.user = user
      })
    }
  },
})
