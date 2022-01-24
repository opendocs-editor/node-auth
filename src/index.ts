import express from "express";
import * as mongodb from "mongodb";
import UserCache from "./db/usercache";
import Token from "./tokens/Token";
import TokenCache from "./tokens/tokencache";
import { createUser } from "./util/data/user";
import * as crypto from "./util/security/crypto";
import * as random from "./util/security/random";

interface MongoDBOptions {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
}

export interface ErrorObject {
    [key: string]: string;
}

interface AuthOptions {
    useGoogleAuth?: boolean;
    googleAuth?: {
        clientId?: string;
        clientSecret?: string;
        websiteBaseUrl?: string;
    };
    useGithubAuth?: boolean;
    githubAuth?: {
        clientId?: string;
        clientSecret?: string;
        websiteBaseUrl?: string;
        scope?: string;
        accessToken?: string;
    };
    useInternalAuth?: boolean;
}

const useAuth = async (
    app: express.Express,
    database: string,
    masterToken: string,
    mongodbOptions?: MongoDBOptions,
    authOptions?: AuthOptions
) => {
    if (authOptions && authOptions.useGoogleAuth)
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[43m\x1b[30m WARN \x1b[0m Google authentication has not been implemented yet. It will not be enabled.`
        );
    if (authOptions && authOptions.useGithubAuth)
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[43m\x1b[30m WARN \x1b[0m GitHub authentication has not been implemented yet. It will not be enabled.`
        );
    if (!mongodb) {
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m The MongoDB library import failed!`
        );
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m Exiting...`
        );
        return;
    }
    if (mongodbOptions && mongodbOptions.user)
        mongodbOptions.user = encodeURIComponent(mongodbOptions.user);
    if (mongodbOptions && mongodbOptions.pass)
        mongodbOptions.pass = encodeURIComponent(mongodbOptions.pass);
    const dbclient = new mongodb.MongoClient(
        `mongodb://${
            mongodbOptions
                ? `${
                      mongodbOptions.user && mongodbOptions.pass
                          ? mongodbOptions.user +
                            ":" +
                            mongodbOptions.pass +
                            "@"
                          : ""
                  }${
                      mongodbOptions.host
                          ? mongodbOptions.host +
                            ":" +
                            (mongodbOptions.port
                                ? mongodbOptions.port
                                : "27017")
                          : "localhost:" +
                            (mongodbOptions.port
                                ? mongodbOptions.port
                                : "27017")
                  }`
                : "localhost:27017"
        }`
    );
    try {
        await dbclient.connect();
        await dbclient.db("admin").command({ ping: 1 });

        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[42m\x1b[30m INFO \x1b[0m Connected!`
        );
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[42m\x1b[30m INFO \x1b[0m Setting up...`
        );

        let userCache = await UserCache(database, dbclient);
        let tokenCache = await TokenCache(database, dbclient);

        app.get("/api/auth/signin/local", (req, res) => {
            res.status(405);
            res.type("application/json");
            res.send({ error: 405, message: "405 Method not allowed." });
            return;
        });

        app.post("/api/auth/signin/local", async (req, res) => {
            if (
                !req.body ||
                !req.body.user ||
                !req.body.pass ||
                !req.body.token
            ) {
                res.status(400);
                res.type("application/json");
                res.send({ error: 400, message: "400 Bad request." });
                return;
            }
            const token = req.body.token;
            const username = req.body.user;
            const password = req.body.pass;
            const tkn = await tokenCache.getToken(token);
            if (tkn) {
                const user = await userCache.getUser(username);
                if (user) {
                    if (
                        crypto.checkPassword(
                            crypto.toPasswordHash(user.credentials as object),
                            password
                        )
                    ) {
                        res.status(200);
                        res.type("application/json");
                        delete user.credentials;
                        delete user._id;
                        res.send(user);
                        return;
                    } else {
                        res.status(403);
                        res.type("application/json");
                        res.send({
                            error: 403,
                            message: "403 Invalid password.",
                        });
                        return;
                    }
                } else {
                    res.status(406);
                    res.type("application/json");
                    res.send({ error: 406, message: "406 Unknown user." });
                    return;
                }
            } else {
                res.status(403);
                res.type("application/json");
                res.send({ error: 403, message: "403 Invalid token." });
                return;
            }
        });

        app.get("/api/auth/register/local", (req, res) => {
            res.status(405);
            res.type("application/json");
            res.send({ error: 405, message: "405 Method not allowed." });
            return;
        });

        app.post("/api/auth/register/local", async (req, res) => {
            if (
                !req.body ||
                !req.body.name ||
                !req.body.user ||
                !req.body.pass ||
                !req.body.email ||
                !req.body.token
            ) {
                res.status(400);
                res.type("application/json");
                res.send({ error: 400, message: "400 Bad request." });
                return;
            }
            const token = req.body.token;
            const username = req.body.user;
            const password = req.body.pass;
            const name = req.body.name;
            const email = req.body.email;
            const tkn = await tokenCache.getToken(token);
            if (tkn) {
                const user = createUser(name, username, email, password);
                await dbclient.db(database).collection("users").insertOne(user);
                userCache = await UserCache(database, dbclient);
                delete user.credentials;
                res.status(200);
                res.type("application/json");
                delete user._id;
                res.send(user);
                return;
            } else {
                res.status(403);
                res.type("application/json");
                res.send({ error: 403, message: "403 Invalid token." });
                return;
            }
        });

        app.get("/api/auth/token/create", (req, res) => {
            res.status(405);
            res.type("application/json");
            res.send({ error: 405, message: "405 Method not allowed." });
            return;
        });

        app.post("/api/auth/token/create", async (req, res) => {
            if (!req.body || !req.body.master || !req.body.holder) {
                res.status(400);
                res.type("application/json");
                res.send({ error: 400, message: "400 Bad request." });
                return;
            }
            const master = req.body.master;
            const holder = req.body.holder;
            if (master === masterToken) {
                const token = new Token(random.randomString(50), holder);
                await dbclient
                    .db(database)
                    .collection("tokens")
                    .insertOne(token);
                tokenCache = await TokenCache(database, dbclient);
                res.status(200);
                res.type("application/json");
                delete token._id;
                res.send(token);
                return;
            } else {
                res.status(403);
                res.type("application/json");
                res.send({ error: 403, message: "403 Invalid token." });
                return;
            }
        });

        app.get("/api/auth/*", (req, res) => {
            res.status(404);
            res.type("application/json");
            res.send({ error: 404, message: "404 Route Not Found" });
        });

        app.get("/api/auth", (req, res) => {
            res.status(404);
            res.type("application/json");
            res.send({ error: 404, message: "404 Route Not Found" });
        });

        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[42m\x1b[30m INFO \x1b[0m Set up!`
        );
    } catch (err: unknown) {
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m \x1b[31mMongoDB Error:\x1b[0m \n\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m \x1b[36m>>\x1b[0m ${(
                err as ErrorObject
            ).errmsg
                .toString()
                .replaceAll(
                    "\n",
                    "\n\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m \x1b[36m>>\x1b[0m "
                )}`
        );
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m Exiting...`
        );
    }
};

if (process.env.NODE_ENV == "development") {
    const dev = async () => {
        const bodyParser = await import("body-parser");
        const cookieParser = await import("cookie-parser");

        const app = express();

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(cookieParser.default());

        useAuth(
            app,
            "node_auth_testing",
            "_fndslmoio3ikmpoeidsjflkjkbghk",
            { user: "NoSadNile", pass: "n0sadn1l3" },
            { useGithubAuth: true, useGoogleAuth: true }
        );

        app.listen(8888, () => {
            console.log(
                `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[42m\x1b[30m INFO \x1b[0m Development server listening on port 8888!`
            );
        });
    };

    dev();
}

export default useAuth;
