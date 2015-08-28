/// <reference path="../../typings/app.d.ts" />

module app.components.simpleGrid {
	'use strict';

	export interface IDataRetreiver {
	   	getData(filterText: string, sortField: string, isAscending: boolean, pageSize: number, pageToRetreive: number): ng.IPromise<IDataResponse>;
	}			   
}
