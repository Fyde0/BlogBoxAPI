import request from "supertest"
import app from "../../app"
import { connectToTestDB, emptyDB } from "../../helpers/tests"
import { isIAllPosts } from "../../interfaces/allPosts"

beforeAll(async () => {
    return connectToTestDB()
})

afterAll(async () => {
    return emptyDB()
})

describe("Test posts endpoints", () => {

    const agent = request.agent(app)

    test("Catch-all route (latest 10 posts)", async () => {
        const res = await agent.get("/posts")

        expect(res.statusCode).toBe(200)
        expect(isIAllPosts(res.body)).toBe(true)
    })
})