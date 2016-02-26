// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'admobModule', 'starter.controllers'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

    });
})
.config(['admobSvcProvider', function (admobSvcProvider) {
    // Optionally you can configure the options here:
    admobSvcProvider.setOptions({
        publisherId:          "pub-8921580138781833",  // Required
        //interstitialAdId:     "ca-app-pub-XXXXXXXXXXXXXXXX/IIIIIIIIII",  // Optional
        //tappxIdiOs:           "/XXXXXXXXX/Pub-XXXX-iOS-IIII",            // Optional
        //tappxIdAndroid:       "ca-app-pub-8921580138781833/4490251191",        // Optional
        //tappxShare:           0.5                                        // Optional

        //adSize:               admob.AD_SIZE.SMART_BANNER,
        bannerAtTop:          false,
        overlap:              false,
        offsetStatusBar:      false,
        isTesting:            false,
        adExtras :            {},
        autoShowBanner:       true,
        autoShowInterstitial: true
    });

    // Optionally configure the events prefix (by default set to 'admob:')
    admobSvcProvider.setPrefix('myTag~');
}])
.run(['admobSvc', '$rootScope', function (admobSvc, $rootScope) {
    // Also you could configure the options here (or in any controller):
    // admobSvcProvider.setOptions({ ... });

    admobSvc.createBannerView();
    // You could also call admobSvc.createBannerView(options);


    // Handle events:
    $rootScope.$on(admobSvc.events.onAdOpened, function onAdOpened(evt, e) {
        console.log('adOpened: type of ad:' + e.adType);
    });
}])
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
          url: '/app',
          abstract: true,
          templateUrl: 'templates/menu.html',
          controller: 'AppCtrl'
      })
      .state('app.generate', {
          url: '/generate',
          views: {
              'menuContent': {
                  templateUrl: 'templates/generate.html',
                  controller: 'GenerateCtrl',
                  controllerAs: 'vm'
              }
          }
      })
      .state('app.about', {
          url: '/about',
          views: {
              'menuContent': {
                  templateUrl: 'templates/about.html',
                  controller: 'AboutCtrl'
              }
          }
      })
    ;
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/generate');
})
.config(function ($provide) {

                var debug = true; // could change to false in production
                
    // catch exceptions in angular
    $provide.decorator('$exceptionHandler', ['$delegate', function ($delegate) {
        return function (exception, cause) {
            $delegate(exception, cause);

            var data = {
                type: 'angular',
                url: window.location.hash,
                localtime: Date.now()
            };
            if (cause) { data.cause = cause; }
            if (exception) {
                if (exception.message) { data.message = exception.message; }
                if (exception.name) { data.name = exception.name; }
                if (exception.stack) { data.stack = exception.stack; }
            }

            if (debug) {
                console.log('exception', data);
                window.alert('Error: ' + data.message);
            } else {
               // track('exception', data);
            }
        };
    }]);
    // catch exceptions out of angular
    window.onerror = function (message, url, line, col, error) {
        var stopPropagation = debug ? false : true;
        var data = {
            type: 'javascript',
            url: window.location.hash,
            localtime: Date.now()
        };
        if (message) { data.message = message; }
        if (url) { data.fileName = url; }
        if (line) { data.lineNumber = line; }
        if (col) { data.columnNumber = col; }
        if (error) {
            if (error.name) { data.name = error.name; }
            if (error.stack) { data.stack = error.stack; }
        }

        if (debug) {
            console.log('exception', data);
            window.alert('Error: ' + data.message);
        } else {
           // track('exception', data);
        }
        return stopPropagation;
    };
            }
)
;
