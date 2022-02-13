import express from "express";
import * as crypto from "../security/crypto";
import * as TokenCache from "../../tokens/tokencache";
import * as UserCache from "../../db/usercache";
import { createUser } from "../data/user";
import * as mongodb from "mongodb";

interface LocalAuthOptions {
    database: string;
    dbclient: mongodb.MongoClient;
    tokenCache: TokenCache.TokenCacheType;
    userCache: UserCache.UserCacheType;
}

const init = (app: express.Express, options: LocalAuthOptions) => {
    app.get("/api/auth/login/local", (req, res) => {
        res.status(405);
        res.type("application/json");
        res.send({ code: 405, message: "405 Method not allowed." });
        return;
    });

    app.post("/api/auth/login/local", async (req, res) => {
        if (!req.body || !req.body.user || !req.body.pass || !req.body.token) {
            res.status(400);
            res.type("application/json");
            res.send({ code: 400, message: "400 Bad request." });
            return;
        }
        const token = req.body.token;
        const username = req.body.user;
        const password = req.body.pass;
        const tkn = await options.tokenCache.getToken(token);
        if (tkn) {
            const user = await options.userCache.getUser(username);
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
                        code: 403,
                        message: "403 Invalid password.",
                    });
                    return;
                }
            } else {
                res.status(406);
                res.type("application/json");
                res.send({ code: 406, message: "406 Unknown user." });
                return;
            }
        } else {
            res.status(403);
            res.type("application/json");
            res.send({ code: 403, message: "403 Invalid token." });
            return;
        }
    });

    app.get("/api/auth/register/local", (req, res) => {
        res.status(405);
        res.type("application/json");
        res.send({ code: 405, message: "405 Method not allowed." });
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
            res.send({ code: 400, message: "400 Bad request." });
            return;
        }
        const token = req.body.token;
        const username = req.body.user;
        const password = req.body.pass;
        const name = req.body.name;
        const email = req.body.email;
        const tkn = await options.tokenCache.getToken(token);
        if (tkn) {
            const user = createUser(name, username, email, password);
            await options.dbclient
                .db(options.database)
                .collection("users")
                .insertOne(user);
            options.userCache = await UserCache.default(
                options.database,
                options.dbclient
            );
            delete user.credentials;
            res.status(200);
            res.type("application/json");
            delete user._id;
            res.send({ code: 200, message: user });
            return;
        } else {
            res.status(403);
            res.type("application/json");
            res.send({ code: 403, message: "403 Invalid token." });
            return;
        }
    });
};

export default init;
