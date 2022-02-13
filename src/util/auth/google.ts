import express from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";

interface GoogleAuthConfig {
    /**
     * Options for Google Auth.
     */
    googleAuth?: {
        /**
         * Google OAuth2 client ID.
         */
        clientId?: string;
        /**
         * Google OAuth2 client secret.
         */
        clientSecret?: string;
        /**
         * Your website base URL.
         */
        websiteBaseUrl?: string;
    };
    /**
     * The token for JsonWebToken to sign it's cookies with.
     */
    jwtSecret?: string;
}

const OAuth2 = google.auth.OAuth2;

const init = (app: express.Express, config: GoogleAuthConfig) => {
    if (
        !config.googleAuth ||
        !config.googleAuth.clientId ||
        !config.googleAuth.clientSecret ||
        !config.googleAuth.websiteBaseUrl
    )
        return;

    app.get("/api/auth/login/google", (req, res) => {
        const oauth2Client = new OAuth2(
            config.googleAuth?.clientId,
            config.googleAuth?.clientSecret,
            (config.googleAuth?.websiteBaseUrl?.endsWith("/")
                ? config.googleAuth?.websiteBaseUrl.slice(0, -1)
                : config.googleAuth?.websiteBaseUrl) +
                "/api/auth/callback/google"
        );
        const loginLink = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: [
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
                "openid",
            ],
        });
        return res.redirect(loginLink);
    });

    app.get("/api/auth/callback/google", (req, res) => {
        const oauth2Client = new OAuth2(
            config.googleAuth?.clientId,
            config.googleAuth?.clientSecret,
            config.googleAuth?.websiteBaseUrl + "/api/auth/callback/google"
        );
        if (req.query.error) {
            return res.redirect("/api/auth/login/google");
        } else {
            const code = req.query.code as string;
            if (!code) return res.redirect("/api/auth/login/google");
            oauth2Client.getToken(code, function (err, token) {
                if (err) return res.redirect("/api/auth/login/google");
                res.cookie(
                    "jwt",
                    jwt.sign(
                        token as string,
                        config.jwtSecret ||
                            "iaupjp3oiaksldoj3ihr0fojfkjhdfsjkghfjknds"
                    )
                );
                return res.redirect("/get_some_data");
            });
        }
    });
};

export default init;
