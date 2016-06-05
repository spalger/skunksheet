import angular from 'angular'

angular.module('Skunk.notify', [])

.service('notify', class Notify {
  fatalErrors = []
  messages = []

  toMsg(val) {
    if (val instanceof Error) {
      return val.stack
    }

    return String(val)
  }

  fatal(err) {
    this.fatalErrors.push(this.toMsg(err))
  }

  success(msg) {
    this.messages.push(msg)
  }

  warning(msg) {
    this.messages.push(msg)
  }
})
