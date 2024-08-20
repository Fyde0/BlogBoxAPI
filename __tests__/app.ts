import request from "supertest"
import app from "../app"
import { connectToTestDB, disconnectFromDB } from "../helpers/tests"

beforeEach(async () => {
    return connectToTestDB()
})

afterEach(async () => {
    return disconnectFromDB()
})

describe("Test app.ts", () => {
  test("Catch-all route", async () => {
    const res = await request(app).get("/")
    expect(res.statusCode).toBe(404)
  })
})