import * as uuid from "uuid";
import UserModel from "src/models/UserModel";
import * as crypto from "../security/crypto";

export const createUser = (
    name: string,
    username: string,
    email: string,
    password_: string
): UserModel => {
    const uid = uuid.v4();
    const password = crypto.hashPassword(password_);
    const user = new UserModel(name, username, email, uid, password);
    return user;
};
