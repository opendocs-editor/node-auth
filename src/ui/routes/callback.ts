import express from "express";

const callback = (
    req: express.Request,
    res: express.Response
) => {
    if (!req.query || !req.query.to) {
        res.status(400);
        res.type("application/json");
        res.send({ code: 400, message: "Bad request." });
        return;
    }
    return res.redirect(req.query.to as string);
};

export default callback;
