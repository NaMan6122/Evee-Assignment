import mongoose from "mongoose";
import { DB_NAME } from "../constants/names.js";

const connectDB = async function(){
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`, {
            serverSelectionTimeoutMS: 4500,
        });
        console.log(`Connected to MongoDB!! ${connectionInstance.connection.host}`);
    }catch(error){
        console.log("Error connecting to MongoDB!!")
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;

