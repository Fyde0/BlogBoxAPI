import request from "supertest"
import app from "../app"
import { connectAndInitDB, closeDB } from "../helpers/tests"

beforeEach(async () => {
  return connectAndInitDB()
})

afterEach(async () => {
  return closeDB()
})

describe("Test app.ts", () => {

  const agent = request.agent(app)

  test("should return 404 on invalid route", async () => {
    const res = await agent.get("/invalid")
    expect(res.statusCode).toBe(404)
  })
})