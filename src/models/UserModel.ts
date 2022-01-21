import mongodb from "mongodb";

interface UserPasswordCredentials {
    hash: string;
    salt: string;
}

class UserModel {
    constructor(
        public name?: string,
        public username?: string,
        public email?: string,
        public uuid?: string,
        public credentials?: UserPasswordCredentials,
        public id?: mongodb.ObjectId
    ) {}
}

export default UserModel;
