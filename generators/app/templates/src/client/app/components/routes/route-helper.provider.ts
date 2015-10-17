/// <reference path="../../typings/app.d.ts" />

/* 
 * Todo: implement in a more typescript friendly way
*/
module app.components.routes {
    'use strict';

	export interface IRouteHelper {
		addRoutes(states: angular.ui.IState[]): void;
        getStates(): angular.ui.IState[];
        stateCounts(): IStateCount;
    }

	export interface IStateCount {
		errors: number;
		changes: number;
	}

	routeHelperProvider.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];
	function routeHelperProvider($locationProvider, $stateProvider, $urlRouterProvider) {
        /* jshint validthis:true */
        var config = {
            docTitle: undefined,
            resolveAlways: {}
        };

		$locationProvider.html5Mode(false);

        this.configure = function(cfg) {
            angular.extend(config, cfg);
        };

        this.$get = RouterHelper;

        RouterHelper.$inject = ['$location', '$rootScope', '$state', '$log'];
        function RouterHelper($location, $rootScope, $state, $log) {
            var handlingStateChangeError = false;
            var stateCounts = {
                errors: 0,
                changes: 0
            };

            var service = {
				addRoutes: addRoutes,
				addWhen: addWhen,
                getStates: getStates,
                stateCounts: stateCounts
            };

            init();

            return service;

            ///////////////

			function addWhen(initialUrl: string, redirectUrl: string): void {
				$urlRouterProvider.when(initialUrl, redirectUrl);
			}

            function addRoutes(states) {
				states.forEach(function(state) {
					state.resolve = angular.extend(state.resolve || {}, config.resolveAlways);
					$stateProvider.state(state.name, state);
				});
			}

            function handleRoutingErrors() {
                // Route cancellation:
                // On routing error, go to the dashboard.
                // Provide an exit clause if it tries to do it twice.
                $rootScope.$on('$stateChangeError',
                    function(event, toState, toParams, fromState, fromParams, error) {
                        if (handlingStateChangeError) {
                            return;
                        }
                        stateCounts.errors++;
                        handlingStateChangeError = true;
                        var destination = (toState &&
                            (toState.title || toState.name || toState.loadedTemplateUrl)) ||
                            'unknown target';
                        var msg = 'Error routing to ' + destination + '. ' +
                            (error.data || '') + '. <br/>' + (error.statusText || '') +
                            ': ' + (error.status || '');
                        $log.error(msg);
                        $location.path('/');
                    }
                );
            }

            function init() {
				$log.debug('Routes initialising');
                handleRoutingErrors();
				initialiseBaseStates();
            }

            function getStates() { return $state.get(); }

			// initial setup. Does not belong here :-/
			function initialiseBaseStates() {
				$urlRouterProvider.otherwise('/404');
			}
        }
    }

	angular.module('app.components.routes').provider('routeHelper', <ng.IServiceProviderFactory>routeHelperProvider);
}
