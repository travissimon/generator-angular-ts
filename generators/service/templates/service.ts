/// <reference path="../../typings/app.d.ts" />

module app.components.<%= namespace.camel %> {
    'use strict';

	export class <%= service.capital %>Service {

		static $inject = ['$log'];
		constructor(private $log: ng.ILogService) {
		}
	}

	app.Module.load('app.<%= isComponent ? 'components' : 'pages' %>.<%= namespace.camel %>').addService('<%= service.capital %>Service', <%= service.capital %>Service);
}
