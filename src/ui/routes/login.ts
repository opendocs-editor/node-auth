import express from "express";
import * as crypto from "../../util/security/crypto";
import * as UserCache from "../../db/usercache";
import * as TokenCache from "../../tokens/tokencache";

const login = async (
    req: express.Request,
    res: express.Response,
    userCache: UserCache.UserCacheType,
    tokenCache: TokenCache.TokenCacheType
) => {
    if (!req.query || !req.query.username || !req.query.password) {
        res.status(400);
        res.type("application/json");
        res.send({ code: 400, message: "Bad request." });
        return;
    }
    const user = await userCache.getUser(req.query.username as string);
    if (
        !user ||
        !user.credentials ||
        !user.email ||
        !user.name ||
        !user.username ||
        !user.uuid ||
        !user._id
    ) {
        res.status(403);
        res.type("application/json");
        res.send({ code: 403, message: "Invalid username or password." });
        return;
    }
    if (crypto.checkPassword(user.credentials, req.query.password as string)) {
        res.status(200);
        res.type("application/json");
        res.send({ code: 200, message: user });
        return;
    } else {
        res.status(403);
        res.type("application/json");
        res.send({ code: 403, message: "Invalid username or password." });
        return;
    }
};

export default login;
