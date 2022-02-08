import express from "express";
import useAuth from "../src"; 
import env from "./env";

const dev = async () => {
    console.log(
        `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[45m\x1b[30m DEV \x1b[0m \x1b[43m\x1b[30m WARN \x1b[0m This is NOT a production-ready app. This is meant for learning and development purposes only. The database may be insecure, and there may be bugs. YOU HAVE BEEN WARNED!`
    );

    const bodyParser = await import("body-parser");
    const cookieParser = await import("cookie-parser");

    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser.default());

    await useAuth(
        app,
        "node_auth_testing",
        {}, 
        {
            useGithubAuth: true,
            useGoogleAuth: true,
            googleAuth: env
        }
    );

    app.listen(4502, () => {
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[45m\x1b[30m DEV \x1b[0m \x1b[42m\x1b[30m INFO \x1b[0m Development server listening on port 4502!`
        );
    });
};

dev();