/// <reference path="../../typings/app.d.ts" />

module app.pages.<%= namespace.kebab %> {
    'use strict';

	export interface <%= pagename.capital %>Scope extends ng.IScope {
		vm: <%= pagename.capital %>Controller;
	}

	export class <%= pagename.capital %>Controller {

		static $inject = ['$scope', '$log'];
		constructor(private $scope: EditScope, private $log: ng.ILogService) {
			this.init();
			$scope.vm = this;
		}

		init(): void {
		}

	}

	app.Module.load('app.pages.<%= namespace.kebab %>').addController('<%= pagename.capital %>Controller', <%= pagename.capital %>Controller);
}
