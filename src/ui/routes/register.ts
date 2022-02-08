import express from "express";
import * as UserCache from "../../db/usercache";

const register = async (
    req: express.Request,
    res: express.Response,
    userCache: UserCache.UserCacheType
) => {
    if (
        !req.query ||
        !req.query.username ||
        !req.query.password ||
        !req.query.name ||
        !req.query.email ||
        !/.+@.+\..+/gm.test(req.query.email as string)
    ) {
        res.status(400);
        res.type("application/json");
        res.send({ code: 400, message: "Bad request." });
        return;
    }
    if ((await userCache.getUser(req.query.username as string)) != null) {
        res.status(400);
        res.type("application/json");
        res.send({ code: 400, message: "User already exists!" });
        return;
    }
    const user = await userCache.createUser(
        req.query.name as string,
        req.query.username as string,
        req.query.email as string,
        req.query.password as string
    );
    res.status(200);
    res.type("application/json");
    res.send({ code: 200, message: user });
};

export default register;
