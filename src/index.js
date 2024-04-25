// require('dotenv').config({path: "./env"})

import dotenv from "dotenv"
import  connectDB from "./db/index.js"
import e from "express";

dotenv.config({
    path:"./env"
})

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is runnning on port:${process.env.PORT}`)
    })
}).catch((err)=>{
    console.log("Mongo db connection failed", err);
})
