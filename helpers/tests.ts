import mongoose from "mongoose"
import User from "../models/user"
import Post from "../models/post"

export async function connectAndInitDB() {
    if (!process.env.MONGODB_URL_TESTING) {
        throw new Error("Environment variable MONGODB_URL_TESTING required.")
    }

    await mongoose.connect(process.env.MONGODB_URL_TESTING)
    await User.deleteMany({})
    await Post.deleteMany({})
    console.log("Connected to MongoDB.")
}

export async function closeDB() {
    await mongoose.connection.close()
}

export const requestHeaders = { "Content-Type": "application/json" }