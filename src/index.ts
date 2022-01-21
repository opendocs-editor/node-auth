import express from "express";
import mongodb from "mongodb";

interface MongoDBOptions {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
}

// interface AuthOptions {
//     useGoogleAuth?: boolean;
//     googleAuth?: {
//         clientId?: string;
//         clientSecret?: string;
//     };
// }

const useAuth = async (
    app: express.Express,
    mongodbOptions?: MongoDBOptions
) => {
    if (mongodbOptions && mongodbOptions.user)
        mongodbOptions.user = encodeURIComponent(mongodbOptions.user);
    if (mongodbOptions && mongodbOptions.pass)
        mongodbOptions.pass = encodeURIComponent(mongodbOptions.pass);
    const dbclient = new mongodb.MongoClient(
        `mongodb+srv://${
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
        }/?authMechanism=X.509&authenticationDatabase=admin`
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

export default useAuth;
