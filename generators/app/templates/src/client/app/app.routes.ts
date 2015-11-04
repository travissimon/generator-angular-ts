/// <reference path="typings/app.d.ts" />

module app {
	
	export class AppRoutesConfigurator {

		$inject = ['routeHelper'];
		constructor(routeHelper) {
			routeHelper.addRoutes(AppRoutesConfigurator.getStates());
			routeHelper.addWhen('', '/home');
			routeHelper.addWhen('/', '/home');
		}

		static getStates(): Array<angular.ui.IState> {
			return [{
				name: '404',
				url: '/404',
				views: {
					'main': {
						templateUrl: 'app/pages/404.template.html',
					}
				}
			}];
		}

	}

	app.Module.load('app').run(AppRoutesConfigurator);

}
