/// <reference path="../../typings/app.d.ts" />

module app.components.simpleGrid {
	'use strict';

	export interface IDataResponse {
		totalItems: number;
		currentPage: number;
		rows: any[];
	}
}
