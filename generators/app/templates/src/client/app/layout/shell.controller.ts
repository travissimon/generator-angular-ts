/// <reference path="../typings/app.d.ts" />

module app.layout {
    'use strict';

	export interface ShellControllerScope extends ng.IScope {
		vm: ShellController;
	}

	export class ShellController {
		public isBusy: boolean = true;
		public busyMessage: string = 'Please wait';
		public showSplash = true;

		static $inject = ['$rootScope', '$timeout'];
		constructor(private $rootScope: ShellControllerScope, private $timeout: ng.ITimeoutService) {
			this.$rootScope.vm = this;
			this.activate();
		}

		private activate(): void {
			this.hideSplash();
		}

		public hideSplash() {
			// Force a 1 second delay so we can see the splash.
			this.$timeout(() => {
				this.showSplash = false;
			}, 1000);
		}
	}

	app.Module.load('app.layout').addController('ShellController', ShellController);
}
