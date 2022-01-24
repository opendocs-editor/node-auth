import crypto from "crypto";

export interface PasswordHash {
    hash: string;
    salt: string;
}

export interface HashObjectConversion {
    [key: string]: string;
}

export const toPasswordHash = (hash: object): PasswordHash => {
    const password: PasswordHash = {
        hash: (hash as HashObjectConversion).hash,
        salt: (hash as HashObjectConversion).salt,
    };
    return password;
};

export const hashPassword = (password: string): PasswordHash => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
        .pbkdf2Sync(password, salt, 1000, 64, "sha512")
        .toString("hex");
    const returnVal: PasswordHash = {
        salt: salt,
        hash: hash,
    };
    return returnVal;
};

export const checkPassword = (
    hash: PasswordHash,
    passwordToCheck: string
): boolean => {
    const newHash = crypto
        .pbkdf2Sync(passwordToCheck, hash.salt, 1000, 64, "sha512")
        .toString("hex");
    return hash.hash === newHash;
};
