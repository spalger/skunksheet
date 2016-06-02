import angular from 'angular'
import './horizon'

angular.module('Skunk.sheet', [
  'Skunk.horizon',
])

.component('skunkSheet', {
  template: `
    <h1>Issues</h1>

    <form ng-submit="sheet.addIssue()" name="sheet.form">
      <input type="text" ng-model="sheet.pendingIssue.text">
    </form>

    <div ng-if="sheet.loading">
      <p>loading...</p>
    </div>

    <div ng-if="!sheet.loading">
      <ol>
        <li ng-repeat="issue in sheet.issues">
          <pre>{{ issue | json }}</pre>
        </li>
      </ol>

    </div>
  `,

  controllerAs: 'sheet',
  controller(horizon, $scope) {
    this.$onInit = () => {
      $scope.$sub(
        horizon('issues')
          .limit(10)
          .watch()
        ,
        issues => {
          this.issues = issues
        }
      )
    }

    this.addIssue = () => {
      horizon('issues').store(this.pendingIssue)
      this.pendingIssue = {}
    }

    this.deleteIssue = issue => {
      horizon('issues').remove(issue.id)
    }

    // this.getCurrentVersionIssues = version => {
    //   this.loading = true
    //
    //   const url = `https://api.github.com/repos/hub-cap/skunksheet/issues?labels=version:${version}`
    //   $http.get(url)
    //   .then(response => this.formatIssueResponse(response))
    //   .then(issues => {
    //     this.loading = false
    //     this.issues = issues
    //   })
    // }

    this.formatIssueResponse = (response) => response.data.map(issue => {
      const isInProgress = issue.labels.some(l => l.name === 'in progress')
      const isComplete = issue.labels.some(l => l.name === 'completed')

      return {
        name: issue.title,
        link: issue.url,
        isInProgress,
        isComplete,
      }
    })
  },
})
