/// <reference path="../../typings/app.d.ts" />

module app.components.api {
    'use strict';

	export interface IArticleStub {
		id: number;
		title: string;
		date: Date;
	}

	export interface IArticle {
		id: number;
		title: string;
		subhead: string;
		dateline: string;
		date: Date;
		body: string;
	}

}
