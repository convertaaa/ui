import {Converter} from "@converta/api";

export type ConverterPackage = {
	name: string,
	author: string,
	description: string,
	version: string,
	converters: LocalConverter[],
}

export type LocalConverter = {
	converter: Converter<any, any>,
	enabled: boolean
}

export type UninstalledConverterPackage = {
	name: string,
	author: string,
	description: string,
	version: string,
	scriptUrl: string,
	packageJsonUrl: string
}