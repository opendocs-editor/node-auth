import express from "express";
import callback from "./routes/callback";
import login from "./routes/login";
import register from "./routes/register";
import * as UserCache from "../db/usercache";
import * as TokenCache from "../tokens/tokencache";

const init = (
    app: express.Express,
    userCache: UserCache.UserCacheType,
    tokenCache: TokenCache.TokenCacheType
) => {
    app.get("/api/auth/ui/local", (req, res) => {
        if (req.query && req.query.action) {
            switch (req.query.action) {
                case "login":
                    login(req, res, userCache, tokenCache);
                    break;
                case "register":
                    register(req, res, userCache, tokenCache);
                    break;
                case "callback":
                    callback(req, res, userCache, tokenCache);
                    break;
                default:
                    res.status(400);
                    res.type("application/json");
                    res.send({ code: 400, message: "Bad request." });
                    break;
            }
        } else {
            res.status(400);
            res.type("application/json");
            res.send({ code: 400, message: "Bad request." });
        }
    });
};

export default init;
