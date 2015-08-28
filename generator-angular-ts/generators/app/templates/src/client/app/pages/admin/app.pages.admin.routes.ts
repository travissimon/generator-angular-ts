/// <reference path="../../typings/app.d.ts" />

module app.pages.admin {

	class AdminRoutesConfigurator {

		$inject = ['routeHelper', '$log'];
		constructor(routeHelper, $log) {
			routeHelper.addRoutes(AdminRoutesConfigurator.getStates());
			$log.debug('Added admin routes');
		}

		static getStates(): Array<angular.ui.IState> {
			return [{
				name: 'adminIndex',
				url: '/admin',
				views: {
					'sidebar': {
						templateUrl: 'app/pages/admin/sidebar.template.html',
					},
					'main': {
						templateUrl: 'app/pages/admin/home.template.html',
					}
				}
			}];
		}

	}

	app.Module.load('app.pages.admin').run(AdminRoutesConfigurator);

}
