(function () {
  'use strict';

  var app = angular.module('app', []);

  app.config(appConfig);
  app.run(appRun);

  /* @ngInject */
  function appConfig($logProvider, $compileProvider) {
    $logProvider.debugEnabled(false);
    // $compileProvider.debugInfoEnabled(false);
  }

  /* @ngInject */
  function appRun() {
  }
}());
