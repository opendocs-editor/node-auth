import * as queryString from "query-string";
import axios from "axios";

const createLoginUrl = (
    clientId: string,
    scope: string[],
    allowSignup = true,
    websiteBaseUrl: string
): string => {
    const params = queryString.stringify({
        client_id: clientId,
        scope: scope.join(" "),
        allow_signup: allowSignup,
        redirect_uri: `${websiteBaseUrl}${
            websiteBaseUrl.endsWith("/") ? "" : "/"
        }api/auth/github`,
    });
    return `https://github.com/login/auth/authorize?${params}`;
};

const getAccessTokenFromCode = async (
    code: string,
    clientId: string,
    clientSecret: string,
    websiteBaseUrl: string
): Promise<string> => {
    const { data } = await axios({
        url: "https://github.com/login/oauth/access_token",
        method: "get",
        params: {
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: `${websiteBaseUrl}${
                websiteBaseUrl.endsWith("/") ? "" : "/"
            }api/auth/github`,
            code,
        },
    });
    const parsedData = queryString.parse(data);
    if (parsedData.error)
        throw new Error(parsedData.error_description?.toString());
    if (!parsedData.access_token)
        throw new ReferenceError("No token recieved!");
    return parsedData.access_token.toString();
};

const getGitHubUserData = async (access_token: string): Promise<object> => {
    const { data } = await axios({
        url: "https://api.github.com/user",
        method: "get",
        headers: {
            Authorization: `token ${access_token}`,
        },
    });
    return data;
};

export default {
    createLoginUrl,
    getAccessTokenFromCode,
    getGitHubUserData,
};
