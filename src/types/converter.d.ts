import {Converter} from "@converta/api";

export type InstalledConverterPackage = {
	name: string,
	author: string,
	description: string,
	version: string,
	packageJsonPath: string,
	converter: Converter<any, any>[]
}

export type UninstalledConverterPackage = {
	name: string,
	author: string,
	description: string,
	version: string,
	scriptUrl: string,
	packageJsonUrl: string
}