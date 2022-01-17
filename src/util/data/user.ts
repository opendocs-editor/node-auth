import * as uuid from "uuid";
import "src/models/UserModel";
import * as crypto from "../security/crypto";
import mongoose from "mongoose";

const UserModel = mongoose.model("user");

export const createUser = (
    name: string,
    username: string,
    email: string,
    password_: string
): mongoose.Document<unknown, unknown, unknown> & {
    _id: mongoose.Types.ObjectId;
} => {
    const uid = uuid.v4();
    const password = crypto.hashPassword(password_);
    const user = new UserModel();
    user.set("name", name);
    user.set("username", username);
    user.set("email", email);
    user.set("uuid", uid);
    user.set("credentials.hash", password.hash);
    user.set("credentials.salt", password.salt);
    return user;
};
