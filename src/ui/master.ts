import express from "express";
import callback from "./routes/callback";
import login from "./routes/login";
import register from "./routes/register";
import * as UserCache from "../db/usercache";

const init = (app: express.Express, userCache: UserCache.UserCacheType) => {
    app.get("/api/auth/ui/local", (req, res) => {
        if (req.query && req.query.action) {
            switch (req.query.action) {
                case "login":
                    login(req, res, userCache);
                    break;
                case "register":
                    register(req, res, userCache);
                    break;
                case "callback":
                    callback(req, res);
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
