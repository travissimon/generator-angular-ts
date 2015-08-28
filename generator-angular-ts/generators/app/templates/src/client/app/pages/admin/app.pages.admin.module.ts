/// <reference path="../../typings/app.d.ts" />

((): void => {
	app.Module.create('app.pages.admin', [
		'ui.router',
		'app.components.routes',
	]);
})()
