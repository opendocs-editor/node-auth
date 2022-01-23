import * as database_ from "../db/index";
import mongodb from "mongodb";
import Token from "./Token";

const TokenCache = async (database: string, client: mongodb.MongoClient) => {
    const dbmanager = new database_.DatabaseManager(client);

    const tokens: Token[] = [];

    try {
        const objs = await dbmanager.getMultipleObjects({
            collection: "tokens",
            database: database,
            data: {},
        });

        objs.forEach((doc) => {
            if (!doc || !doc.value || !doc.holder || !doc._id) return;
            tokens.push(new Token(doc.value, doc.holder, doc._id));
        });
    } catch (e) {
        console.log(
            `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m An error occured while getting tokens from the database.`
        );
    }

    return {
        tokens,

        getToken: async (value: string): Promise<Token | null> => {
            try {
                const doc = await dbmanager.getObject({
                    collection: "tokens",
                    database: database,
                    data: { value: value },
                });

                if (!doc || !doc.value || !doc.holder || !doc._id) return null;

                return new Token(doc.value, doc.holder, doc._id);
            } catch (e) {
                console.log(
                    `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m An error occured while getting a token from the database.`
                );
                return null;
            }
        },

        getTokenByHolder: async (holder: string): Promise<Token | null> => {
            try {
                const doc = await dbmanager.getObject({
                    collection: "users",
                    database: database,
                    data: { golder: holder },
                });

                if (!doc || !doc.value || !doc.holder || !doc._id) return null;

                return new Token(doc.value, doc.holder, doc._id);
            } catch (e) {
                console.log(
                    `\x1b[46m\x1b[30m AUTHLIB \x1b[0m \x1b[41m\x1b[30m ERROR \x1b[0m An error occured while getting a token from the database.`
                );
                return null;
            }
        },

        getCachedToken: (value: string): Token | null => {
            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i].value == value) return tokens[i];
            }
            return null;
        },

        getCachedTokenByHolder: (holder: string): Token | null => {
            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i].holder == holder) return tokens[i];
            }
            return null;
        },
    };
};

export default TokenCache;
