/// <reference path="../../typings/app.d.ts" />

((): void => {
	app.Module.create('app.pages.<%= namespace.kebab %>', [
		'ui.router',
	]);
})()
