import request from "supertest"
import app, { setupSessionSecret } from "../app"
import { connectAndInitDB, closeDB } from "../helpers/tests"

beforeEach(async () => {
  return connectAndInitDB()
})

afterEach(async () => {
  return closeDB()
})

describe("Test app.ts", () => {

  test("should throw if SESSION_SECRET is not set", async () => {
    delete process.env.SESSION_SECRET
    expect(() => setupSessionSecret()).toThrow()
  })

  test("should return 404 on invalid route", async () => {
    const agent = request.agent(app)

    const res = await agent.get("/invalid")

    expect(res.statusCode).toBe(404)
  })
})