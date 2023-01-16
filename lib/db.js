import { MongoClient } from "mongodb";

export async function connectDatabase() {
    const client = await MongoClient.connect('mongodb+srv://hero:heroherohero@cluster1.dmcghae.mongodb.net/userData?retryWrites=true&w=majority')
    return client;
}