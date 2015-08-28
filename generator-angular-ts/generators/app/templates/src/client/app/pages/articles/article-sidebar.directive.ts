/// <reference path="../../typings/app.d.ts" />

module app.pages.articles {
    'use strict';

	interface ArticleSidebarScope extends ng.IScope {
		vm: {
			articles: app.components.api.IArticleStub[];
		};
	}

	class ArticleSidebarDirective implements ng.IDirective {
		bindToController: boolean = false;
		restrict: string = 'EA';
		scope: {};
		templateUrl: string = 'app/pages/articles/article-sidebar.template.html';
		link = (scope: ArticleSidebarScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
			var self = this;
			this.NewsService.getArticleStubs().then(function articleStubCallback(result) {
				scope.vm.articles = result;
			});
		};

		constructor(private $log: ng.ILogService, private NewsService: app.components.api.NewsService) {
		}


		static factory(): ng.IDirectiveFactory {
			var directive = ($log: ng.ILogService, NewsService: app.components.api.NewsService) => {
				return new ArticleSidebarDirective($log, NewsService);
			};

			directive.$inject = ['$log', 'NewsService'];

			return directive;
		}

	}

	app.Module.load('app.pages.articles').addDirective('appSidebar', ArticleSidebarDirective.factory());
}

