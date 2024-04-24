import mongoose from "mongoose";
import { Db_NAME } from "../constants.js"

const connectDB= async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${Db_NAME}`)
        console.log(`\n mongodb connected !! DB HOST:${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection Failed",error);
        process.exit(1)
    }
}

export default connectDB