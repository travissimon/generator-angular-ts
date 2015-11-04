/// <reference path="../../typings/app.d.ts" />

module app.pages.<%= namespace.camel %> {
    'use strict';

	export interface <%= pagename.capital %>Scope extends ng.IScope {
		vm: <%= pagename.capital %>Controller;
	}

	export class <%= pagename.capital %>Controller {

		static $inject = ['$scope', '$log'];
		constructor(private $scope: <%= pagename.capital %>Scope, private $log: ng.ILogService) {
			this.init();
			$scope.vm = this;
		}

		init(): void {
		}

	}

	app.Module.load('app.pages.<%= namespace.camel %>').addController('<%= pagename.capital %>Controller', <%= pagename.capital %>Controller);
}
