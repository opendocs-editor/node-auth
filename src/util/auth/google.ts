import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

interface GoogleConfiguration {
    clientId: string;
    clientSecret: string;
    redirect: string;
}

const config = (
    clientId: string,
    clientSecret: string,
    websiteBaseUrl: string
): GoogleConfiguration => {
    const conf: GoogleConfiguration = {
        clientId: clientId,
        clientSecret: clientSecret,
        redirect: `${websiteBaseUrl}${
            websiteBaseUrl.endsWith("/") ? "" : "/"
        }api/auth/google`,
    };
    return conf;
};

const createConnection = (
    clientId: string,
    clientSecret: string,
    websiteBaseUrl: string
): OAuth2Client => {
    return new google.auth.OAuth2(
        config(clientId, clientSecret, websiteBaseUrl)
    );
};

const defaultScope = [
    "https://www.googleapis.com/auth/plus.me",
    "https://www.googleapis.com/auth/userinfo.email",
];

const createAuthUrl = (client: OAuth2Client): string => {
    return client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: defaultScope,
    });
};

const getGooglePlusApi = (client: OAuth2Client) => {
    return google.plus({ version: "v1", auth: client });
};

const getAccountFromCode = async (
    code: string,
    client: OAuth2Client,
    clientId: string,
    clientSecret: string,
    websiteBaseUrl: string
) => {
    const data = await client.getToken(code);
    const tokens = data.tokens;
    const auth = createConnection(
        clientId,
        clientSecret,
        `${websiteBaseUrl}${
            websiteBaseUrl.endsWith("/") ? "" : "/"
        }api/auth/google`
    );
    auth.setCredentials(tokens);
    const plus = getGooglePlusApi(auth);
    const me = await plus.people.get({ userId: "me" });
    const userGoogleId = me.data.id;
    const userGoogleEmail =
        me.data.emails && me.data.emails.length && me.data.emails[0].value;
    return {
        id: userGoogleId,
        email: userGoogleEmail,
        tokens: tokens,
    };
};

export default {
    create: createConnection,
    createAuthUrl,
    getGooglePlusApi,
    getAccountFromCode,
};
