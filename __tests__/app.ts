import request from "supertest"
import app from "../app"
import { connectToTestDB, emptyDB } from "../helpers/tests"

beforeEach(async () => {
  return connectToTestDB()
})

afterEach(async () => {
  return emptyDB()
})

describe("Test app.ts", () => {

  const agent = request.agent(app)

  test("Catch-all route", async () => {
    const res = await agent.get("/")
    expect(res.statusCode).toBe(404)
  })
})