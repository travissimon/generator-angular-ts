/// <reference path="../../typings/app.d.ts" />

module app.pages.home {
    'use strict';

	export interface HomepageScope extends ng.IScope {
		vm: HomepageController;
	}

	export class HomepageController {

		static $inject = ['$scope', '$log'];
		constructor(private $scope: HomepageScope, private $log: ng.ILogService) {
			this.init();
			$scope.vm = this;
		}

		init(): void {
		}

	}

	app.Module.load('app.pages.home').addController('HomepageController', HomepageController);
}
