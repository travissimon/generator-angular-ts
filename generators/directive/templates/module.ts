/// <reference path="../../typings/app.d.ts" />

((): void => {
    app.Module.create('app.components.<%= namespace.camel %>', [
		'ui.router',
	]);
})();
