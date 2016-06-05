import angular from 'angular'
import 'angular-route'
import { size } from 'lodash'

import './auth'
import './Sheet'
import './notify'

angular.module('Skunk.app', ['ngRoute', 'Skunk.sheet', 'Skunk.notify', 'Skunk.auth'])

.component('skunkApp', {
  template: `
    <div ng-if="!skunk.jwt">
      <a href="/auth/github">Login with GitHub</a>
    </div>

    <div ng-if="skunk.jwt">
      <ul ng-if="skunk.messages">
        <li ng-repeat="msg in skunk.messages">{{ msg }}</pre>
      </ul>

      <div ng-if="!skunk.fatalErrors">
        <p>Hi, {{ skunk.jwt.userLogin }}</p>
        <ng-view></ng-view>
      </div>

      <div ng-if="skunk.fatalErrors">
        <h1>Fatal error</h1>
        <pre ng-repeat="error in skunk.fatalErrors">{{ error }}</pre>
      </div>
    </div>
  `,
  controllerAs: 'skunk',
  controller: class SkunkController {
    constructor($scope, auth, notify, $location, $http) {
      $scope.$watch(() => auth.jwt, jwt => {
        this.jwt = jwt
      })

      $scope.$watch(() => notify.fatalErrors, fatals => {
        this.fatalErrors = size(fatals) ? fatals : null
      })

      $scope.$watch(() => notify.messages, messages => {
        this.messages = size(messages) ? messages : null
      })
    }
  },
})
