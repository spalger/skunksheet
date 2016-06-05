import angular from 'angular'

angular.module('Skunk.sheet', [])

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
  controller() {
    this.$onInit = () => {
    }

    this.addIssue = () => {
      this.pendingIssue = {}
    }

    this.deleteIssue = issue => {
    }

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
