import angular from 'angular'

angular.module('ShunkApp.Sheet', [])

.component('shunkSheet', {
  template: `
    <h1>Issues</h1>

    <div ng-if="sheet.loading">
      <p>loading...</p>
    </div>

    <div ng-if="!sheet.loading">
      <pre>{{sheet.issues | json}}</pre>
    </div>
  `,

  controllerAs: 'sheet',
  controller($http) {
    this.$onInit = () => {
      this.getCurrentVersionIssues('1.0.0')
    }

    this.getCurrentVersionIssues = version => {
      this.loading = true

      const url = `https://api.github.com/repos/hub-cap/skunksheet/issues?labels=version:${version}`
      $http.get(url)
      .then(response => this.formatIssueResponse(response))
      .then(issues => {
        this.loading = false
        this.issues = issues
      })
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
