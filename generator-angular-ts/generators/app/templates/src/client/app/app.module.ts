/// <reference path="typings/app.d.ts" />

((): void => {
	app.Module.create('app', [
		'ui.router',
		'app.components.api',
		'app.components.navbar',
		'app.components.profiling',
		'app.components.routes',
		'app.components.stacktrace',
		'app.layout',
		'app.pages.admin',
		'app.pages.articles',
	]);
})()
