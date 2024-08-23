import request from "supertest"
// 
import app from "../../app"
import { closeDB, connectAndInitDB, initBlogSettings, loginAgent, makeUserAdmin, registerAgent, requestHeaders } from "../../helpers/tests"
import { defaultBlogSettings } from "../../interfaces/blogSettings"
import BlogSettings from "../../models/blogSettings"

beforeEach(async () => {
    await connectAndInitDB()
})

afterEach(async () => {
    return closeDB()
})

describe("GET /blog/settings", () => {

    test("should fail getting settings with 500 if db is not connected", async () => {
        const agent = request.agent(app)
        await closeDB()

        const res = await agent
            .get("/blog/settings")
            .set(requestHeaders)

        expect(res.statusCode).toBe(500)
    })

    test("should fail getting settings with 500 if they are missing", async () => {
        const agent = request.agent(app)

        const res = await agent
            .get("/blog/settings")
            .set(requestHeaders)

        expect(res.statusCode).toBe(500)
    })

    test("should get the default blog settings", async () => {
        const agent = request.agent(app)
        await initBlogSettings()

        const res = await agent
            .get("/blog/settings")
            .set(requestHeaders)

        expect(res.statusCode).toBe(200)
        expect(res.body.title === defaultBlogSettings.title).toBe(true)
        expect(res.body.theme === defaultBlogSettings.theme).toBe(true)
    })
})

describe("PATCH /blog/settings", () => {

    test("should fail changing blog settings with 401 if user is not admin", async () => {
        const agent = request.agent(app)
        await initBlogSettings()
        await registerAgent(agent)
        await loginAgent(agent)

        const newSettings = defaultBlogSettings
        newSettings.theme = "flatly"
        newSettings.title = "New Title"

        const res = await agent
            .patch("/blog/settings")
            .set(requestHeaders)
            .send(newSettings)

        expect(res.statusCode).toBe(401)
    })

    test("should fail changing settings with 422 on invalid object", async () => {
        const agent = request.agent(app)
        await initBlogSettings()
        await registerAgent(agent)
        await loginAgent(agent)
        await makeUserAdmin()

        const newSettings = { invalid: "..." }

        const res = await agent
            .patch("/blog/settings")
            .set(requestHeaders)
            .send(newSettings)

        expect(res.statusCode).toBe(422)
    })

    test("should change blog settings and return the new settings", async () => {
        const agent = request.agent(app)
        await initBlogSettings()
        await registerAgent(agent)
        await loginAgent(agent)
        await makeUserAdmin()

        const newSettings = defaultBlogSettings
        newSettings.theme = "flatly"
        newSettings.title = "New Title"

        const res = await agent
            .patch("/blog/settings")
            .set(requestHeaders)
            .send(newSettings)

        expect(res.statusCode).toBe(200)
        expect(res.body.theme === newSettings.theme).toBe(true)
        expect(res.body.title === newSettings.title).toBe(true)
    })
})