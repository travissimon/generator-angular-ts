/// <reference path="../../typings/app.d.ts" />

((): void => {
	app.Module.create('app.pages.articles', [
		'ui.router',
		'app.components.api',
		'app.components.navbar',
		'app.components.routes',
	]);
})()
