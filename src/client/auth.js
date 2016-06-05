import angular from 'angular'
import jwtDecode from 'jwt-decode'

angular.module('Skunk.auth', [])

.service('auth', function AuthService($rootScope, notify, $http, $location) {
  const checkForSuccessFlag = () => {
    const { auth } = $location.search()
    if (auth === 'success') {
      $http({
        method: 'GET',
        url: '/auth/jwt',
        headers: {
          Authorization: 'request',
        },
      })
      .then(({ data }) => {
        notify.success('login success')
        $location.search('auth', null).replace()
        localStorage.setItem('jwt', data)
      })
      .catch(err => notify.fatal(err))
    }
  }

  const parseJwt = () => {
    const jwt = localStorage.getItem('jwt')

    if (!jwt) {
      this.jwt = null
    } else {
      this.jwt = jwtDecode(jwt)
    }
  }

  checkForSuccessFlag()
  parseJwt()
  angular.element(window).on('storage', e => {
    if (e.key === 'jwt') $rootScope.$apply(parseJwt)
  })
})
