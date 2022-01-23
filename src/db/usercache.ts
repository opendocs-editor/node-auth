import * as database_ from "./index";
import mongodb from "mongodb";
import UserModel from "../models/UserModel";

const UserCache = async (database: string, client: mongodb.MongoClient) => {
    const dbmanager = new database_.DatabaseManager(client);

    const users: UserModel[] = [];

    try {
        const objs = await dbmanager.getMultipleObjects({
            collection: "users",
            database: database,
            data: {},
        });

        objs.forEach((doc) => {
            if (
                !doc ||
                !doc.name ||
                !doc.username ||
                !doc.email ||
                !doc.uuid ||
                !doc.credentials ||
                !doc.credentials.hash ||
                !doc.credentials.salt ||
                !doc._id
            )
                return;
            users.push(
                new UserModel(
                    doc.name,
                    doc.username,
                    doc.email,
                    doc.uuid,
                    doc.credentials,
                    doc._id
                )
            );
        });
    } catch (e) {
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m An error occured while getting users from the database.`
        );
    }

    return {
        users,

        getUser: async (username: string): Promise<UserModel | null> => {
            try {
                const doc = await dbmanager.getObject({
                    collection: "users",
                    database: database,
                    data: { username: username },
                });
                if (
                    !doc ||
                    !doc.name ||
                    !doc.username ||
                    !doc.email ||
                    !doc.uuid ||
                    !doc.credentials ||
                    !doc.credentials.hash ||
                    !doc.credentials.salt ||
                    !doc._id
                )
                    return null;
                return new UserModel(
                    doc.name,
                    doc.username,
                    doc.email,
                    doc.uuid,
                    doc.credentials,
                    doc._id
                );
            } catch (e) {
                console.log(
                    `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m An error occured while getting a user from the database.`
                );
                return null;
            }
        },

        getUserByUUID: async (uuid: string): Promise<UserModel | null> => {
            try {
                const doc = await dbmanager.getObject({
                    collection: "users",
                    database: database,
                    data: { uuid: uuid },
                });
                if (
                    !doc ||
                    !doc.name ||
                    !doc.username ||
                    !doc.email ||
                    !doc.uuid ||
                    !doc.credentials ||
                    !doc.credentials.hash ||
                    !doc.credentials.salt ||
                    !doc._id
                )
                    return null;
                return new UserModel(
                    doc.name,
                    doc.username,
                    doc.email,
                    doc.uuid,
                    doc.credentials,
                    doc._id
                );
            } catch (e) {
                console.log(
                    `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m An error occured while getting a user from the database.`
                );
                return null;
            }
        },

        getCachedUser: (username: string): UserModel | null => {
            for (let i = 0; i < users.length; i++) {
                if (users[i].username == username) return users[i];
            }
            return null;
        },

        getCachedUserByUUID: (uuid: string): UserModel | null => {
            for (let i = 0; i < users.length; i++) {
                if (users[i].uuid == uuid) return users[i];
            }
            return null;
        },
    };
};

export default UserCache;
