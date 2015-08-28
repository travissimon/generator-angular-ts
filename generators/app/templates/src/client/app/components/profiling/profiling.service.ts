/// <reference path="../../typings/app.d.ts" />

module app.components.profiling {
    'use strict';

	export class ProfileService {

		public enableProfiling = false;

		$inject = ['$log'];
		constructor(private $log: ng.ILogService) {
		}

		public profile(profileName: string, fn: Function) {
			if (this.enableProfiling) {
				return function() {
					console.profile(profileName);
					var returnValue = fn.apply(this.arguments);
					console.profileEnd();
					return returnValue;
				};
			} else {
				return function() {
					return fn.apply(this, arguments);
				};
			}
		}

	}

	app.Module.load('app.components.profiling').addService('ProfileService', ProfileService);
}
