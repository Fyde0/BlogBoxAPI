import mongoose from "mongoose"
import TestAgent from "supertest/lib/agent"
import * as crypto from "crypto"
// 
import User from "../models/user"
import Post from "../models/post"
import BlogSettings from "../models/blogSettings"
import { isIPost } from "../interfaces/post"

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

export async function logoutAgent(agent: TestAgent) {
    await agent
        .get("/users/logout")
        .set(requestHeaders)
}

export async function createPost(agent: TestAgent, tags?: string[]) {
    const res = await agent
        .post("/posts/create")
        .field("post", JSON.stringify(
            {
                title: crypto.randomBytes(20).toString('hex'),
                content: crypto.randomBytes(20).toString('hex'),
                tags
            }
        ))

    if (typeof res.body === "string") {
        return res.body
    }
    throw new Error()
}

export async function getPost(agent: TestAgent, postId: string) {
    console.log("/posts/byPostId/" + postId)
    const res = await agent
        .get("/posts/byPostId/" + postId)
        .set(requestHeaders)

    if (isIPost(res.body)) {
        return res.body
    }
    throw new Error()
}