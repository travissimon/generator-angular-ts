/// <reference path="../../typings/app.d.ts" />

module app.pages.<%= namespace.kebab %> {

	class <%= namespace.capital %>RoutesConfigurator {

		static $inject = ['routeHelper', '$log'];
		constructor(routeHelper: app.components.routes.IRouteHelper, $log: ng.ILogService) {
			routeHelper.addRoutes(<%= namespace.capital %>RoutesConfigurator.getStates());
		}

		static getStates(): Array<angular.ui.IState> {
			return [];
		}
	}

	app.Module.load('app.pages.<%= namespace.kebab %>').run(<%= namespace.capital %>RoutesConfigurator);

}
