import mongodb from "mongodb";

class InvalidObjectError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class DatabaseObject {
    constructor(
        public database: string,
        public collection: string,
        public data: object
    ) {}
}

export class DatabaseObjectList {
    constructor(
        public database: string,
        public collection: string,
        public data: object[]
    ) {}
}

export class DatabaseManager {
    private client: mongodb.MongoClient;

    constructor(client: mongodb.MongoClient) {
        this.client = client;
    }

    insert(
        obj: DatabaseObject
    ): Promise<mongodb.InsertOneResult<mongodb.Document>>;
    insert(
        objs: DatabaseObjectList
    ): Promise<mongodb.InsertManyResult<mongodb.Document>>;

    insert(
        obj: unknown
    ):
        | Promise<mongodb.InsertOneResult<mongodb.Document>>
        | Promise<mongodb.InsertManyResult<mongodb.Document>>
        | null {
        if (obj instanceof DatabaseObject) {
            return this.client
                .db(obj.database)
                .collection(obj.collection)
                .insertOne(obj.data);
        } else if (obj instanceof DatabaseObjectList) {
            return this.client
                .db(obj.database)
                .collection(obj.collection)
                .insertMany(obj.data);
        }
        throw new InvalidObjectError(
            "The object supplied is not a DatabaseObjecct or a DatabaseObjectList!"
        );
    }

    getObject(
        searchObj: DatabaseObject
    ): Promise<mongodb.WithId<mongodb.Document> | null> {
        return this.client
            .db(searchObj.database)
            .collection(searchObj.collection)
            .findOne(searchObj.data, {});
    }

    getMultipleObjects(
        searchObj: DatabaseObject
    ): mongodb.FindCursor<mongodb.WithId<mongodb.Document>> {
        return this.client
            .db(searchObj.database)
            .collection(searchObj.collection)
            .find(searchObj.data, {});
    }
}
