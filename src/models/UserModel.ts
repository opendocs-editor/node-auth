import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    uuid: String,
    credentials: {
        hash: String,
        salt: String,
    },
});

const UserModel = mongoose.model("user", schema);

export default UserModel;
