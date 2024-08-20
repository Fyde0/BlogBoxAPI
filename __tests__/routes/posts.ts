import request from "supertest"
import app from "../../app"
import { connectToTestDB, disconnectFromDB } from "../../helpers/tests"
import { isIAllPosts } from "../../interfaces/allPosts"

beforeEach(async () => {
    return connectToTestDB()
})

afterEach(async () => {
    return disconnectFromDB()
})

describe("Test posts.ts", () => {
    test("Catch-all route (latest 10 posts)", async () => {
        const res = await request(app).get("/posts")
        expect(res.statusCode).toBe(200)
        expect(isIAllPosts(res.body)).toBe(true)
    })
})