/// <reference path="../../typings/app.d.ts" />

module app.pages.articles {
    'use strict';

	export interface ArticleDetailScope extends ng.IScope {
		vm: ArticleDetailController;
	}

	export class ArticleDetailController {

		static $inject = ['$scope', '$log', '$stateParams', 'NewsService'];
		constructor(private $scope: ArticleDetailScope, private $log: ng.ILogService, private $stateParams: any, private NewsService: app.components.api.NewsService) {
			this.init();
		}

		init(): void {
			this.loadArticle();
		}

		public article: app.components.api.IArticle = null;

		private loadArticle(): void {
			var self = this;
			var articleId = this.$stateParams.id;
			var self = this;
			this.NewsService.getArticleById(articleId).then(function(result) {
				self.article = result;
			});
		}
	}

	app.Module.load('app.pages.articles').addController('ArticleDetailController', ArticleDetailController);
}

