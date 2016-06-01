import angular from 'angular'
import 'angular-route'
import { size } from 'lodash'

import './auth'
import './sheet'
import './notify'

angular.module('Skunk.app', ['ngRoute', 'Skunk.sheet', 'Skunk.notify'])

.component('skunkApp', {
  template: `
    <ul ng-if="skunk.messages">
      <li ng-repeat="msg in skunk.messages">{{ msg }}</pre>
    </ul>

    <div ng-if="!skunk.fatalErrors">
      <p>Hi, {{ skunk.user.profile.login }}</p>
      <ng-view></ng-view>
    </div>

    <div ng-if="skunk.fatalErrors">
      <h1>Fatal error</h1>
      <pre ng-repeat="error in skunk.fatalErrors">{{ error }}</pre>
    </div>
  `,
  controllerAs: 'skunk',
  controller: class SkunkController {
    constructor($scope, horizon, auth, notify) {
      $scope.$watch(() => notify.fatalErrors, fatals => {
        this.fatalErrors = size(fatals) ? fatals : null
      })

      $scope.$watch(() => notify.messages, messages => {
        this.messages = size(messages) ? messages : null
      })

      $scope.$sub(
        horizon.currentUser().watch(),
        user => {
          this.user = user
        },
        error => {
          if (error.message.includes('User account has been deleted')) {
            auth.reauth()
          } else {
            notify.fatal(error)
          }
        }
      )
    }
  },
})
