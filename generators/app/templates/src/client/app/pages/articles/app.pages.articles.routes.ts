/// <reference path="../../typings/app.d.ts" />

module app.pages.articles {

	class ArticleRoutesConfigurator {

		$inject = ['routeHelper', '$log'];
		constructor(routeHelper: app.components.routes.IRouteHelper, $log: ng.ILogService) {
			routeHelper.addRoutes(ArticleRoutesConfigurator.getStates());
			$log.debug('Added article routes');
		}

		static getStates(): Array<angular.ui.IState> {
			return [{
				name: 'article',
				url: '/articles',
				templateUrl: 'app/pages/articles/article-shell.template.html',
			}, {
				name: 'article.index',
				url: '/index',
				templateUrl: 'app/pages/articles/article-index.template.html',
				controller: app.pages.articles.ArticleIndexController,
				controllerAs: 'vm',
			}, {
				name: 'article.detail',
				url: '/{id:int}',
				templateUrl: 'app/pages/articles/article-detail.template.html',
				controller: app.pages.articles.ArticleDetailController,
				controllerAs: 'vm',
			}];
		}
	}

	app.Module.load('app.pages.articles').run(ArticleRoutesConfigurator);

}
