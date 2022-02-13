import express from "express";
import useAuth from "../src"; 
import env from "./env";

const dev = async () => {
    console.log(
        `\x1b[45m\x1b[30m DEV \x1b[0m \x1b[43m\x1b[30m WARN \x1b[0m This is NOT a production-ready app. This is meant for learning and development purposes only.`
    );

    const app = express();

    process.env.NODE_ENV = "development";

    await useAuth(
        app,
        "node_auth_testing",
        {}, 
        {
            useGithubAuth: true,
            useGoogleAuth: true,
            googleAuth: env,
        },
    );

    app.listen(4502, () => {
        console.log(
            `\x1b[45m\x1b[30m DEV \x1b[0m \x1b[42m\x1b[30m INFO \x1b[0m Development server listening on port 4502!`
        );
    });
};

dev();