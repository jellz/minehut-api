import { Server } from "./server";
import { Minehut } from "../minehut";
import { KVManager } from "../managers/kvManager";
import { DetailedServer } from "./detailedServer";

interface RawUser {
    _id: string;
    email: string;
    email_verified: boolean;
    email_sent_at: number;
    email_code: string;
    credits: number;
    last_login: number;
    last_password_change?: number;
    minecraft_link_code?: string;
    minecraft_last_link_time?: number;
    minecraft_name?: string;
    minecraft_uuid?: string;
    max_servers: number;
    servers: string[];
}

interface RawUserResponse {
    user: RawUser;
}

interface User {
    id: string;
    emailInfo: {
        email: string;
        verified: boolean;
        sentAt: Date;
        code: string;
    };
    credits: number;
    lastLogin: Date;
    lastPasswordChange?: number;
    minecraftInfo?: {
        linkCode?: string;
        lastLinkTime?: Date;
        username?: string;
        uuid?: string;
    };
    maxServers: number;
    servers: DetailedServer[];
}
class User {
    constructor(public client: Minehut) {}
}

export class UserManager extends KVManager<RawUserResponse, User> {
    constructor(client: Minehut) {
        super(client, "/user/%s");
    }

    async transform(key: string, { user }: RawUserResponse): Promise<User> {
        const u = new User(this.client);
        u.id = user._id;
        u.emailInfo = {
            email: user.email,
            verified: user.email_verified,
            sentAt: new Date(user.email_sent_at),
            code: user.email_code
        };
        u.credits = user.credits;
        u.lastLogin = new Date(user.last_login);
        u.lastPasswordChange = user.last_password_change;
        if (user.minecraft_last_link_time)
            u.minecraftInfo = {
                linkCode: user.minecraft_link_code,
                lastLinkTime: new Date(user.minecraft_last_link_time),
                username: user.minecraft_name,
                uuid: user.minecraft_uuid
            };
        u.maxServers = user.max_servers;
        u.servers = await Promise.all(
            user.servers.map((id) => this.client.servers.fetchOne(id))
        );
        return u;
    }
}

export { User };
