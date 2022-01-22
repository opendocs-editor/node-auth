import express from "express";
import * as mongodb from "mongodb";
import UserCache from "./db/usercache";

interface MongoDBOptions {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
}

interface AuthOptions {
    useGoogleAuth?: boolean;
    googleAuth?: {
        clientId?: string;
        clientSecret?: string;
        websiteBaseUrl?: string;
    };
    useGithubAuth?: boolean;
    githubAuth?: {
        clientId?: string;
        clientSecret?: string;
        websiteBaseUrl?: string;
        scope?: string;
        accessToken?: string;
    };
}

const useAuth = async (
    app: express.Express,
    database: string,
    mongodbOptions?: MongoDBOptions,
    authOptions?: AuthOptions
) => {
    if (authOptions && authOptions.useGoogleAuth)
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[43m\x1b[30m WARN \x1b[0m Google authentication has not been implemented yet. It will not be enabled.`
        );
    if (authOptions && authOptions.useGithubAuth)
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[43m\x1b[30m WARN \x1b[0m GitHub authentication has not been implemented yet. It will not be enabled.`
        );
    if (!mongodb) {
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m The MongoDB library import failed!`
        );
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m Exiting...`
        );
        return;
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
        }${
            mongodbOptions && mongodbOptions.user && mongodbOptions.pass
                ? "/?authSource=admin&authMechanism=MONGODB-X509"
                : ""
        }`
    );
    try {
        await dbclient.connect();
        await dbclient.db("admin").command({ ping: 1 });

        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[42m\x1b[30m INFO \x1b[0m Connected!`
        );
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[42m\x1b[30m INFO \x1b[0m Setting up...`
        );

        const userCache = await UserCache(database, dbclient);

        // app.post("/api/auth/signin/local", (req, res) => {});
        app.get("/api/auth/*", (req, res) => {
            res.status(404);
            res.type("application/json");
            res.send({ error: 404, message: "494 Route Not Found" });
        });
    } catch (err: any) {
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m \x1b[31mMongoDB Error:\x1b[0m \n\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m \x1b[36m>>\x1b[0m ${err.errmsg
                .toString()
                .replaceAll(
                    "\n",
                    "\n\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m \x1b[36m>>\x1b[0m "
                )}`
        );
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m Exiting...`
        );
    } finally {
        await dbclient.close();
    }
};

useAuth(express(),"node_auth_testing", { }, { useGithubAuth: true, useGoogleAuth: true });

export default useAuth;
