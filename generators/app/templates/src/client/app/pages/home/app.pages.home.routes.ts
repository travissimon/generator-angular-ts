/// <reference path="../../typings/app.d.ts" />

module app.pages.home {

	class HomeRoutesConfigurator {

		static $inject = ['routeHelper', '$log'];
		constructor(routeHelper: app.components.routes.IRouteHelper, $log: ng.ILogService) {
			routeHelper.addRoutes(HomeRoutesConfigurator.getStates());
		}

		static getStates(): Array<angular.ui.IState> {
			return [
				{
					"name": "home",
					"url": "/home",
					"controller": app.pages.home.HomepageController,
					"controllerAs": "vm",
					"templateUrl": "app/pages/home/homepage.template.html"
				}
			]
		}
	}

	app.Module.load('app.pages.home').run(HomeRoutesConfigurator);

}
