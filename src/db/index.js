import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"

console.log("db");
const connectDB = async () => {
    console.log(" into the db function");
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`mongoDb connected !!! DB HOST:${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("mongoDB was not able to connect", error);
        // throw error;
        process.exit(1);
    }
}



export default connectDB;