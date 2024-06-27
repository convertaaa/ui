import {ConverterPackage, UninstalledConverterPackage} from "../types/converter";
import * as path from "node:path";
import * as fs from "node:fs";

export class ConverterLoadingUtils {
	static findLocalConverterPackages(app: Electron.App): ConverterPackage[] {
		const appName: string = app.getName();
		const appDataPath: string = app.getPath('appData');
		const converterPath: string = path.join(appDataPath, appName, 'converters');
		const converterPackages: ConverterPackage[] = [];
		
		fs.readdir(converterPath, (err, files) => {
			if (err) {
				console.error('Failed to read converter directory:', err);
				return [];
			}
			
			files.forEach((file: string) => {
				// file must be a directory the converters are saved like this:
				// - converters (we are here, reading this directory)
				//   - author
				//     - packagename
				//       - bundle.ts
				//       - package.json
				
				const packagePath: string = path.join(converterPath, file);
				const packageStat: fs.Stats = fs.statSync(packagePath);
				
				if (!packageStat.isDirectory()) {
					return;
				}
				
				const packageFiles: string[] = fs.readdirSync(packagePath);
				
				packageFiles.forEach((packageFile: string) => {
					const packageFilePath: string = path.join(packagePath, packageFile);
					const packageFileStat: fs.Stats = fs.statSync(packageFilePath);
					
					if (!packageFileStat.isDirectory()) {
						return;
					}
					
					const packageJsonPath: string = path.join(packageFilePath, 'package.json');
					const packageJson: any = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
					const bundlePath: string = path.join(packageFilePath, 'bundle.ts');
					const bundleStat: fs.Stats = fs.statSync(bundlePath);
					
					if (!bundleStat.isFile()) {
						return;
					}
				});
			})
		});
		
		return [];
	}
	
	static async findAllDownloadableConverterPackages(): Promise<UninstalledConverterPackage[]> {
		const packages: UninstalledConverterPackage[] = [];
		const jsonUrl: string = 'https://raw.githubusercontent.com/convertaaa/converter-list/main/repos.json';
		
		try {
			const response = await fetch(jsonUrl);
			const json = await response.json();
			
			const packagePromises = json.repos.map(async (repo: string) => {
				const packageJsonUrl: string = `https://raw.githubusercontent.com/${repo}/main/package.json`;
				const bundleJsUrl: string = `https://raw.githubusercontent.com/${repo}/main/dist/bundle.js`;
				const packageResponse = await fetch(packageJsonUrl);
				const packageJson = await packageResponse.json();
				
				const converterPackage: UninstalledConverterPackage = {
					name: packageJson.name,
					author: packageJson.author,
					description: packageJson.description,
					version: packageJson.version,
					scriptUrl: bundleJsUrl,
					packageJsonUrl: packageJsonUrl
				};
				
				return converterPackage;
			});
			
			const resolvedPackages = await Promise.all(packagePromises);
			packages.push(...resolvedPackages);
			
		} catch (error) {
			console.error("Error fetching packages:", error);
		}
		
		console.log(packages);
		
		return packages;
	}
	
	static downloadConverterPackage(app: Electron.App, uninstalledConverterPackage: UninstalledConverterPackage): void {
		const convertaFolder: string = path.join(app.getPath('appData', ), app.getName());
		
		if (!fs.existsSync(convertaFolder)) {
			fs.mkdirSync(convertaFolder);
		}
		
		const convertersFolder: string = path.join(convertaFolder, 'converters');
		
		if (!fs.existsSync(convertersFolder)) {
			fs.mkdirSync(convertersFolder);
		}
		
		const authorPath: string = path.join(convertersFolder, uninstalledConverterPackage.author);
		
		if (!fs.existsSync(authorPath)) {
			fs.mkdirSync(authorPath);
		}
		
		const converterPackagePath: string = path.join(authorPath, uninstalledConverterPackage.name);
		
		if (fs.existsSync(converterPackagePath)) {
			console.error('Converter package already exists:', converterPackagePath); // TODO: Implement update logic later
			return;
		}
		
		fs.mkdirSync(converterPackagePath, {recursive: true});
		
		const bundlePath: string = path.join(converterPackagePath, 'bundle.ts');
		const packageJsonPath: string = path.join(converterPackagePath, 'package.json');
		
		fetch(uninstalledConverterPackage.scriptUrl)
			.then((response) => response.text())
			.then((text) => {
				fs.writeFileSync(bundlePath, text);
			});
		
		fetch(uninstalledConverterPackage.packageJsonUrl)
			.then((response) => response.json())
			.then((json) => {
				fs.writeFileSync(packageJsonPath, JSON.stringify(json));
			});
	}
}