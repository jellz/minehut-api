import BaseManager from "./baseManager";
import Minehut from ".";

interface Plugin {
	id: string;
	name: string;
	credits: number;
	platform: "java";
	description: string;
	extendedDescription: string;
	version: string;
	disabled: boolean;
	fileName: string;
	configFileName: string;
	created: Date;
	lastUpdated: Date;
}

interface RawPlugin {
	_id: string;
	name: string;
	credits: number;
	platform: "java";
	desc: string;
	desc_extended: string;
	version: string;
	disabled: boolean;
	fileName: string;
	config_file_name: string;
	created: number;
	last_updated: number;
}

interface RawPluginResponse {
	all: RawPlugin[];
	java: RawPlugin[];
	bedrock: RawPlugin[];
}

export class PluginManager extends BaseManager<RawPluginResponse, Plugin[]> {
	constructor(client: Minehut) {
		super(client, "/plugins_public");
	}

	async transform(data: RawPluginResponse): Promise<Plugin[]> {
		return data.all.map((x) => ({
			configFileName: x.config_file_name,
			created: new Date(x.created),
			credits: x.credits,
			description: x.desc,
			extendedDescription: x.desc_extended,
			disabled: x.disabled,
			fileName: x.fileName,
			id: x._id,
			lastUpdated: new Date(x.last_updated),
			name: x.name,
			platform: x.platform,
			version: x.version,
		}));
	}
}
