import express from "express";
import * as Main from "../../index";
import Token from "../../tokens/Token";
import * as random from "../security/random";
import * as mongodb from "mongodb";
import * as TokenCache from "../../tokens/tokencache";

interface TokenOptions {
    dbclient: mongodb.MongoClient;
    database: string;
    tokenCache: TokenCache.TokenCacheType;
}

const init = (
    app: express.Express,
    options: TokenOptions,
    authOptions?: Main.AuthOptions
) => {
    app.get("/api/auth/token/create", (req, res) => {
        res.status(405);
        res.type("application/json");
        res.send({ code: 405, message: "405 Method not allowed." });
        return;
    });

    app.post("/api/auth/token/create", async (req, res) => {
        if (!req.body || !req.body.master || !req.body.holder) {
            res.status(400);
            res.type("application/json");
            res.send({ code: 400, message: "400 Bad request." });
            return;
        }
        const master = req.body.master;
        const holder = req.body.holder;
        if (master === authOptions?.masterToken) {
            const token = new Token(random.randomString(50), holder);
            await options.dbclient
                .db(options.database)
                .collection("tokens")
                .insertOne(token);
            options.tokenCache = await TokenCache.default(
                options.database,
                options.dbclient
            );
            res.status(200);
            res.type("application/json");
            delete token._id;
            res.send({ code: 200, message: token });
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
