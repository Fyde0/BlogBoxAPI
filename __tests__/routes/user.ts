import request from "supertest"
import app from "../../app"
import { connectToTestDB, emptyDB, requestHeaders } from "../../helpers/tests"

beforeAll(async () => {
    return connectToTestDB()
})

afterAll(async () => {
    return emptyDB()
})

describe("Test users endpoints", () => {

    const agent = request.agent(app)

    test("Register user", async () => {
        const res = await agent
            .post("/users/register")
            .set(requestHeaders)
            .send({ username: "user", password: "pass" })

        expect(res.statusCode).toBe(201)
    })

    test("Login", async () => {
        const res = await agent
            .post("/users/login")
            .set(requestHeaders)
            .send({ username: "user", password: "pass" })

        expect(res.statusCode).toBe(200)
    })

    test("Ping", async () => {
        const res = await agent
            .get("/users/ping")
            .set(requestHeaders)

        expect(res.statusCode).toBe(200)
    })
})