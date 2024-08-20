import request from "supertest"
import app from "../../app"
import { connectAndInitDB, closeDB, requestHeaders } from "../../helpers/tests"

beforeAll(async () => {
    return connectAndInitDB()
})

afterAll(async () => {
    return closeDB()
})

describe("Test users endpoints", () => {

    const agent = request.agent(app)

    test("should return password required", async () => {
        const res = await agent
            .post("/users/login")
            .set(requestHeaders)
            .send({ username: "user" })

        expect(res.statusCode).toBe(422)
    })

    test("should register the user", async () => {
        const res = await agent
            .post("/users/register")
            .set(requestHeaders)
            .send({ username: "user", password: "pass" })

        expect(res.statusCode).toBe(201)
    })

    test("should login the user", async () => {
        const res = await agent
            .post("/users/login")
            .set(requestHeaders)
            .send({ username: "user", password: "pass" })

        expect(res.statusCode).toBe(200)
    })

    test("should ping the user", async () => {
        const res = await agent
            .get("/users/ping")
            .set(requestHeaders)

        expect(res.statusCode).toBe(200)
    })

    test("should logout the user", async () => {
        const res = await agent
            .get("/users/logout")
            .set(requestHeaders)

        expect(res.statusCode).toBe(200)
    })
})