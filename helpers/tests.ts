import mongoose from "mongoose"
import TestAgent from "supertest/lib/agent"
import User from "../models/user"
import Post from "../models/post"
import BlogSettings from "../models/blogSettings"

export async function connectAndInitDB() {
    if (!process.env.MONGODB_URL_TESTING) {
        throw new Error("Environment variable MONGODB_URL_TESTING required.")
    }

    await mongoose.connect(process.env.MONGODB_URL_TESTING)
    await User.deleteMany({})
    await Post.deleteMany({})
    await BlogSettings.deleteMany({})
}

export async function closeDB() {
    await mongoose.connection.close()
}

export const requestHeaders = { "Content-Type": "application/json" }

export async function registerAgent(agent: TestAgent) {
    await agent
        .post("/users/register")
        .set(requestHeaders)
        .send({ username: "user", password: "pass" })
}

export async function loginAgent(agent: TestAgent) {
    await agent
        .post("/users/login")
        .set(requestHeaders)
        .send({ username: "user", password: "pass" })
}