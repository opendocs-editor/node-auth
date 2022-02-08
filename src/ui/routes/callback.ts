import express from "express";
import * as UserCache from "../../db/usercache";
import * as TokenCache from "../../tokens/tokencache";

const callback = (
    req: express.Request,
    res: express.Response,
    userCache: UserCache.UserCacheType,
    tokenCache: TokenCache.TokenCacheType
) => {};

export default callback;
