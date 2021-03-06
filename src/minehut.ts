import fetch from "node-fetch";
import { IconManager } from "./objects/icon";
import { ServerManager } from "./objects/server";
import { PluginManager } from "./objects/plugin";
import { UserManager, User } from "./objects/user";
import { stringify } from "querystring";

export class Minehut {
    BASE_URL = "https://api.minehut.com";
    icons: IconManager = new IconManager(this);
    servers: ServerManager = new ServerManager(this);
    plugins: PluginManager = new PluginManager(this);
    users: UserManager = new UserManager(this);
    user?: User;
    auth?: { sessionId: string; token: string };

    async fetchJSON(path: string, method: string = "GET", body?: object) {
        const settings = {
            method,
            headers: {
                "User-Agent": `node-minehut-api/${
                    require("../package.json").version
                }`,
                "Content-Type": body ? "application/json" : "",
                Accept: "application/json",
                Authorization: this.auth?.token || "",
                "X-Session-Id": this.auth?.sessionId || ""
            },
            body: JSON.stringify(body)
        };
        const res = await fetch(this.BASE_URL + path, settings);
        const resBody = await res.json();
        if (process.env.DEBUG == "minehut-api") {
            console.debug(`HTTP ${method}: ${path}`);
            console.debug({ reqBody: body, resBody });
        }

        if (resBody.error) throw new Error(resBody.error);
        if (!res.ok)
            throw new Error(
                `HTTP error while fetching ${path}: ${res.status} ${res.statusText}`
            );
        return await resBody;
    }

    async login(email: string, password: string) {
        const res = (await this.fetchJSON("/users/login", "POST", {
            email,
            password
        })) as {
            _id: string;
            token: string;
            servers: string[];
            sessionId: string;
        };
        this.auth = { sessionId: res.sessionId, token: res.token };
        if (process.env.DEBUG == "minehut-api")
            console.debug("logged in; user now");
        this.user = await this.users.fetch(res._id);
    }
}
