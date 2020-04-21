import Icon from "./icon";
import BaseManager from "./baseManager";
import Minehut from ".";

interface BaseServer {
	playerCount: number;
	online: boolean;
	timeNoPlayers: number;
	name: string;
	motd: string;
	maxPlayers: number;
	visibility: boolean;
	platform: "java";
	players: string[];
	starting: boolean;
	stopping: boolean;
	status: "ONLINE";
}

interface RawServer extends BaseServer {
	_id: string;
	icon?: string;
	lastMetricsUpdate: number;
	lastStatusChange: number;
	lastSave: number;
	startedAt: number;
	updated: number;
}

export default interface Server extends BaseServer {
	id: string;
	icon?: Icon;
	lastMetricsUpdate: Date;
	lastStatusChange: Date;
	lastSave: Date;
	startedAt: Date;
	updated: Date;
}

interface RawServerResponse {
	servers: RawServer[];
	total_players: number;
	total_servers: number;
}

export class ServerManager extends BaseManager<RawServerResponse, Server[]> {
	constructor(client: Minehut) {
		super(client, "/servers");
	}

	async transform(data: RawServerResponse): Promise<Server[]> {
		return await Promise.all(
			data.servers.map(async (raw) => ({
				id: raw._id,
				lastMetricsUpdate: new Date(raw.lastMetricsUpdate),
				lastSave: new Date(raw.lastSave),
				lastStatusChange: new Date(raw.lastStatusChange),
				maxPlayers: raw.maxPlayers,
				motd: raw.motd,
				name: raw.name,
				online: raw.online,
				platform: raw.platform,
				playerCount: raw.playerCount,
				players: raw.players,
				startedAt: new Date(raw.startedAt),
				starting: raw.starting,
				status: raw.status,
				stopping: raw.stopping,
				timeNoPlayers: raw.timeNoPlayers,
				updated: new Date(raw.updated),
				visibility: raw.visibility,
				icon: (await this.client.icons.fetch()).find(
					(x) => x.iconName == raw.icon
				),
			}))
		);
	}
}
