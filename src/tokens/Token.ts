import mongodb from "mongodb";

class Token {
    constructor(
        public value?: string,
        public holder?: string,
        public _id?: mongodb.ObjectId
    ) {}
}

export default Token;
