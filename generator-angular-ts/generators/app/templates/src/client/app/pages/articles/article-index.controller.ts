/// <reference path="../../typings/app.d.ts" />

module app.pages.articles {
    'use strict';

	export interface ArticleIndexScope extends ng.IScope {
		vm: ArticleIndexController;
	}

	export class ArticleIndexController {

		static $inject = ['$scope', '$log', 'NewsService'];
		constructor(private $scope: ArticleIndexScope, private $log: ng.ILogService, private NewsService: app.components.api.NewsService) {
			this.init();
		}

		init(): void {
			this.loadNewsArticles();
		}

		public articles: app.components.api.IArticleStub[] = null;

		private loadNewsArticles(): void {
			var self = this;
			this.NewsService.getArticleStubs().then(function articleStubCallback(result) {
				self.articles = result;
			});
		}

	}

	app.Module.load('app.pages.articles').addController('ArticleIndexController', ArticleIndexController);
}

