/// <reference path="../../typings/app.d.ts" />

module app.components.<%= namespace.camel %> {
    'use strict';

	interface <%= directive.capital %>Scope extends ng.IScope {
	}


	class <%= directive.capital %>Directive implements ng.IDirective {
		bindToController: boolean = false;
		restrict: string = 'EA';
		scope: {};
		templateUrl: string = 'app/<%= isComponent ? 'components' : 'pages' %>/<%=directive.kebab %>.template.html';
		link = (scope: <%= directive.capital %>Scope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
		};


		constructor(private $log: ng.ILogService) {
		}

		static factory(): ng.IDirectiveFactory {
			var directive = ($log: ng.ILogService) => {
				return new <%= directive.capital %>Directive($log);
			};

			directive['$inject'] = ['$log'];

			return directive;
		}

	}

	app.Module.load('app.<%= isComponent ? 'components' : 'pages' %>.<%= namespace.camel %>').addDirective('<%= directive.kebab %>', <%= namespace.capital %>Directive.factory());
}
