/**
 * Authlib
 * Copyright (C) 2022 OpenDocs Editor
 *
 * https://opendocs-editor.github.io/authlib
 * https://github.com/opendocs-editor/node-auth
 *
 * This project is licensed under the MIT license.
 * Its dependencies have their own licenses. Please
 * follow those licenses as well.
 */

import express from "express";
import * as mongodb from "mongodb";
import path from "path";
import UserCache from "./db/usercache";
import TokenCache from "./tokens/tokencache";
import GoogleInit from "./util/auth/google";
import LocalInit from "./util/auth/local";
import TokenInit from "./util/auth/tokens";
import uiRouteInit from "./ui/master";

export interface MongoDBOptions {
    /**
     * Host for the MongoDB server. Leave out the port and the http:// or https://.
     * Defaults to: localhost
     */
    host?: string;
    /**
     * Port of the MongoDB server.
     * Defaults to: 27017
     */
    port?: number;
    /**
     * User to authenticate to the MongoDB server as.
     * Defaults to: None
     */
    user?: string;
    /**
     * Password for authenticating to the MongoDB server.
     * Defaults to: None
     */
    pass?: string;
}

export interface ErrorObject {
    [key: string]: string;
}

export interface AuthOptions {
    /**
     * Whether or not to use Google Auth.
     * Defaults to: false
     */
    useGoogleAuth?: boolean;
    /**
     * Options for Google Auth.
     * Defaults to: null
     */
    googleAuth?: {
        /**
         * Google OAuth2 client ID.
         * Defaults to: null
         */
        clientId?: string;
        /**
         * Google OAuth2 client secret.
         * Defaults to: null
         */
        clientSecret?: string;
        /**
         * Your website base URL.
         * Defaults to: null
         */
        websiteBaseUrl?: string;
    };
    /**
     * Whether or not to use GitHub Auth.
     * Defaults to: false
     */
    useGithubAuth?: boolean;
    /**
     * Options for GitHub Auth.
     * Defaults to: null
     */
    githubAuth?: {
        /**
         * Google OAuth2 client ID.
         * Defaults to: null
         */
        clientId?: string;
        /**
         * Google OAuth2 client secret.
         * Defaults to: null
         */
        clientSecret?: string;
        /**
         * Your website base URL.
         * Defaults to: null
         */
        websiteBaseUrl?: string;
        /**
         * The OAuth2 scope.
         * Defaults to: null
         */
        scope?: string;
        /**
         * The access token for GitHub OAuth.
         * Defaults to: null
         */
        accessToken?: string;
    };
    /**
     * The token for JsonWebToken to sign it's cookies with.
     * Defaults to: REPLACE_ME
     */
    jwtSecret?: string;
    /**
     * Whether or not to use the internal auth provider.
     * Defaults to: true
     */
    useInternalAuth?: boolean;
    /**
     * Whether or not to include the Auth UI.
     * Defaults to: true
     */
    includeAuthUI?: boolean;
    /**
     * The master token to create other tokens with.
     * Defaults to: REPLACE_ME
     */
    masterToken?: string;
}

const useAuth = async (
    app: express.Express,
    database: string,
    mongodbOptions?: MongoDBOptions,
    authOptions?: AuthOptions
) => {
    const bodyParser = await import("body-parser");
    const cookieParser = await import("cookie-parser");

    let isDev = process.env.NODE_ENV?.toLowerCase() == "development";

    if (authOptions && authOptions.useGoogleAuth)
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[43m\x1b[30m WARN \x1b[0m Google authentication is still a work in progress. You have been warned!`
        );
    if (authOptions && authOptions.useGithubAuth)
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[43m\x1b[30m WARN \x1b[0m GitHub authentication has not been implemented yet. It will not be enabled.`
        );
    if (!authOptions?.masterToken || authOptions?.masterToken == "REPLACE_ME") {
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m \x1b[31mThere was no master token provided. The app has been moved into development mode.`
        );
        isDev = true;
    }
    if (!authOptions?.jwtSecret || authOptions?.jwtSecret == "REPLACE_ME") {
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m \x1b[31mThere was no JWT secret provided. The app has been moved into development mode.`
        );
        isDev = true;
    }
    if (!mongodb) {
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m The MongoDB library import failed!`
        );
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m Exiting...`
        );
        return;
    }
    if (isDev) {
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[43m\x1b[30m WARN \x1b[0m \x1b[33mThe app is in development mode. Some security features may be disabled. \x1b[0m`
        );
    }
    if (mongodbOptions && mongodbOptions.user)
        mongodbOptions.user = encodeURIComponent(mongodbOptions.user);
    if (mongodbOptions && mongodbOptions.pass)
        mongodbOptions.pass = encodeURIComponent(mongodbOptions.pass);
    const dbclient = new mongodb.MongoClient(
        `mongodb://${
            mongodbOptions
                ? `${
                      mongodbOptions.user && mongodbOptions.pass
                          ? mongodbOptions.user +
                            ":" +
                            mongodbOptions.pass +
                            "@"
                          : ""
                  }${
                      mongodbOptions.host
                          ? mongodbOptions.host +
                            ":" +
                            (mongodbOptions.port
                                ? mongodbOptions.port
                                : "27017")
                          : "localhost:" +
                            (mongodbOptions.port
                                ? mongodbOptions.port
                                : "27017")
                  }`
                : "localhost:27017"
        }`
    );
    try {
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[42m\x1b[30m INFO \x1b[0m Trying to connect to the database...`
        );
        await dbclient.connect();
        await dbclient.db("admin").command({ ping: 1 });

        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[42m\x1b[30m INFO \x1b[0m Connected!`
        );
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[42m\x1b[30m INFO \x1b[0m Setting up routes...`
        );

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(cookieParser.default());

        const userCache = await UserCache(database, dbclient);
        const tokenCache = await TokenCache(database, dbclient);

        app.set("view engine", "ejs");
        app.set("views", path.join(__dirname, "../views"));

        TokenInit(app, { dbclient, database, tokenCache }, authOptions);

        if (authOptions?.useGoogleAuth) GoogleInit(app, authOptions);
        if (authOptions?.useInternalAuth != false)
            LocalInit(app, { dbclient, database, tokenCache, userCache });
        if (
            authOptions?.useInternalAuth != false &&
            authOptions?.includeAuthUI != false
        )
            uiRouteInit(app, userCache);

        app.get("/api/auth/*", (req, res) => {
            res.status(404);
            res.type("application/json");
            res.send({ code: 404, message: "404 Route Not Found" });
        });

        app.get("/api/auth", (req, res) => {
            res.status(404);
            res.type("application/json");
            res.send({ code: 404, message: "404 Route Not Found" });
        });

        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[42m\x1b[30m INFO \x1b[0m Set up!`
        );
    } catch (err: unknown) {
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m \x1b[31mMongoDB Error:\x1b[0m \n\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m \x1b[36m>>\x1b[0m ${(
                err as ErrorObject
            ).errmsg
                .toString()
                .replaceAll(
                    "\n",
                    "\n\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m \x1b[36m>>\x1b[0m "
                )}`
        );
        app.all("/api/auth", (req, res) => {
            res.status(500);
            res.type("application/json");
            res.send({
                code: 500,
                message:
                    "Could not connect to the database. Please try again soon.",
            });
        });
        app.all("/api/auth/*", (req, res) => {
            res.status(500);
            res.type("application/json");
            res.send({
                code: 500,
                message:
                    "Could not connect to the database. Please try again soon.",
            });
        });
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m Exiting...`
        );
    }
};

export default useAuth;
