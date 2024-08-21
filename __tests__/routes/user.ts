import request from "supertest"
import app from "../../app"
import sharp from "sharp"
// 
import { connectAndInitDB, closeDB, requestHeaders, loginAgent, logoutAgent } from "../../helpers/tests"
import { isIUserInfo } from "../../interfaces/user"
import IUserSettings, { isIUserSettings } from "../../interfaces/userSettings"

beforeAll(async () => {
    return connectAndInitDB()
})

afterAll(async () => {
    return closeDB()
})

describe("POST /users/register", () => {

    const agent = request.agent(app)

    test.each([
        { name: "no password", body: { username: "user" } },
        { name: "no username", body: { password: "pass" } },
        { name: "password too short", body: { username: "user", password: "p" } },
        { name: "username too short", body: { username: "u", password: "pass" } },
        { name: "password too long", body: { username: "user", password: "p".repeat(55) } },
        { name: "username too long", body: { username: "u".repeat(35), password: "pass" } },
        { name: "username containing invalid characters", body: { username: "user.", password: "pass" } },
        { name: "username containing invalid characters", body: { username: "us?er", password: "pass" } },
        { name: "username containing invalid characters", body: { username: "$user", password: "pass" } },
    ])("should fail register with 422 on $name", async ({ body }) => {
        const res = await agent
            .post("/users/register")
            .set(requestHeaders)
            .send(body)

        expect(res.statusCode).toBe(422)
    })

    test("should register the user", async () => {
        const res = await agent
            .post("/users/register")
            .set(requestHeaders)
            .send({ username: "user", password: "pass" })

        expect(res.statusCode).toBe(201)
    })

    test("should fail register with 409 on username already taken", async () => {
        const res = await agent
            .post("/users/register")
            .set(requestHeaders)
            .send({ username: "user", password: "pass" })

        expect(res.statusCode).toBe(409)
    })

})

describe("POST /users/login and GET /users/logout", () => {

    const agent = request.agent(app)

    test.each([
        { name: "no password", body: { username: "user" } },
        { name: "no username", body: { password: "pass" } },
    ])("should fail login with 422 on $name", async ({ body }) => {
        const res = await agent
            .post("/users/login")
            .set(requestHeaders)
            .send(body)

        expect(res.statusCode).toBe(422)
    })

    test("should fail login with 401 on non existing username", async () => {
        const res = await agent
            .post("/users/login")
            .set(requestHeaders)
            .send({ username: "nobody", password: "pass" })

        expect(res.statusCode).toBe(401)
    })

    test("should fail login with 401 on wrong password", async () => {
        const res = await agent
            .post("/users/login")
            .set(requestHeaders)
            .send({ username: "user", password: "psswrd" })

        expect(res.statusCode).toBe(401)
    })

    test("should fail logout with 204 when not logged in", async () => {
        const res = await agent
            .get("/users/logout")
            .set(requestHeaders)

        expect(res.statusCode).toBe(204)
    })

    test("should login the user and return user state", async () => {
        const res = await agent
            .post("/users/login")
            .set(requestHeaders)
            .send({ username: "user", password: "pass" })

        expect(res.statusCode).toBe(200)
        expect(isIUserInfo(res.body.userInfo)).toBe(true)
        expect(isIUserSettings(res.body.userSettings)).toBe(true)
        expect(typeof res.body.admin === "boolean").toBe(true)
    })

    test("should logout the user", async () => {
        const res = await agent
            .get("/users/logout")
            .set(requestHeaders)

        expect(res.statusCode).toBe(200)
    })
})

describe("GET /users/ping", () => {

    const agent = request.agent(app)

    test("should fail ping with 401 when not logged in", async () => {
        const res = await agent
            .get("/users/ping")
            .set(requestHeaders)

        expect(res.statusCode).toBe(401)
    })

    loginAgent(agent)

    test("should ping the user and return admin status", async () => {

        const res = await agent
            .get("/users/ping")
            .set(requestHeaders)

        expect(res.statusCode).toBe(200)
        expect(typeof res.body.isAdmin === "boolean").toBe(true)
    })

    logoutAgent(agent)
})

describe("PATCH /users/settings", () => {

    const agent = request.agent(app)

    test("should fail changing settings with 401 when not logged in", async () => {
        const res = await agent
            .patch("/users/settings")
            .set(requestHeaders)
            .send({ theme: "light" })

        expect(res.statusCode).toBe(401)
    })

    loginAgent(agent)

    test("should fail changing settings with 422 on invalid object", async () => {
        const res = await agent
            .patch("/users/settings")
            .set(requestHeaders)
            .send({ invalid: "???" })

        expect(res.statusCode).toBe(422)
    })

    test("should change user settings and return new settings", async () => {

        const postsPerPage = 15
        const theme = "light"
        const userSettings: IUserSettings = { postsPerPage, theme }

        const res = await agent
            .patch("/users/settings")
            .set(requestHeaders)
            .send(userSettings)

        expect(res.statusCode).toBe(200)
        expect(isIUserSettings(res.body)).toBe(true)
        expect(res.body.postsPerPage === postsPerPage).toBe(true)
        expect(res.body.theme === theme).toBe(true)
    })

    logoutAgent(agent)
})

describe("PATCH /users/update", () => {

    const agent = request.agent(app)

    test("should fail updating user with 401 when not logged in", async () => {
        const res = await agent
            .patch("/users/update")
            .set(requestHeaders)
            .send({ name: "a name" })

        expect(res.statusCode).toBe(401)
    })

    loginAgent(agent)

    test.each([
        { name: "name too long", body: { name: "n".repeat(55) } },
        { name: "about too long", body: { about: "a".repeat(505) } },
    ])("should fail update user with 422 on $name", async ({ body }) => {
        const res = await agent
            .patch("/users/update")
            .set(requestHeaders)
            .send(body)

        expect(res.statusCode).toBe(422)
    })

    test("should fail changing avatar with 422 on file too heavy", async () => {
        const bigPic = await sharp({
            create: {
                width: 512,
                height: 512,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 0 },
                noise: { type: "gaussian", mean: 512, sigma: 5000 }
            }
        }).png({ compressionLevel: 0 }).toBuffer()

        const res = await agent
            .patch("/users/update")
            .attach("avatar", bigPic, "avatar.png")

        expect(res.statusCode).toBe(422)
    })

    test("should fail changing avatar with 422 on non image", async () => {
        const res = await agent
            .patch("/users/update")
            .attach("avatar", Buffer.from("not an image"), "file.txt")

        expect(res.statusCode).toBe(422)
    })

    test("should update user name and about", async () => {
        const name = "a name"
        const about = "about me"
        const res = await agent
            .patch("/users/update")
            .set(requestHeaders)
            .send({ name, about })

        expect(res.statusCode).toBe(200)
        expect(isIUserInfo(res.body)).toBe(true)
        expect(res.body.name === name).toBe(true)
        expect(res.body.about === about).toBe(true)
    })

    test("should upload avatar", async () => {
        const pic = await sharp({
            create: {
                width: 64,
                height: 64,
                channels: 3,
                background: { r: 255, g: 0, b: 0 }
            }
        }).jpeg().toBuffer()

        const res = await agent
            .patch("/users/update")
            .attach("avatar", pic, "avatar.jpg")

        expect(res.statusCode).toBe(200)
        expect(res.body.avatar.includes("avatar")).toBe(true)
    })

    test("should delete avatar", async () => {
        const res = await agent
            .patch("/users/update")
            .set(requestHeaders)
            .send({ deleteAvatar: true })

        expect(res.statusCode).toBe(200)
        expect(res.body.avatar).toBe(undefined)
    })

    logoutAgent(agent)
})

describe("PATCH /users/password", () => {

    const agent = request.agent(app)
    const newPassword = "newpass"

    test("should fail changing password with 401 when not logged in", async () => {
        const res = await agent
            .patch("/users/password")
            .set(requestHeaders)
            .send({ oldPassword: "pass", newPassword })

        expect(res.statusCode).toBe(401)
    })

    loginAgent(agent)

    test("should fail changing password with 422 on old password missing", async () => {
        const res = await agent
            .patch("/users/password")
            .set(requestHeaders)
            .send({ newPassword })

        expect(res.statusCode).toBe(422)
    })

    test.each([
        { name: "new password missing", newPassword: undefined },
        { name: "new password too short", newPassword: "p" },
        { name: "new password too long", newPassword: "p".repeat(55) },
    ])("should fail changing password with 422 on $name", async ({ newPassword }) => {
        const res = await agent
            .patch("/users/password")
            .set(requestHeaders)
            .send({ oldPassword: "pass", newPassword })

        expect(res.statusCode).toBe(422)
    })

    test("should fail changing password with 401 on wrong old password", async () => {
        const res = await agent
            .patch("/users/password")
            .set(requestHeaders)
            .send({ oldPassword: "wrongpass", newPassword })

        expect(res.statusCode).toBe(401)
    })

    test("should change password", async () => {
        const res = await agent
            .patch("/users/password")
            .set(requestHeaders)
            .send({ oldPassword: "pass", newPassword })

        expect(res.statusCode).toBe(200)
    })

    logoutAgent(agent)

    test("should login with new password", async () => {
        const res = await agent
            .post("/users/lohin")
            .set(requestHeaders)
            .send({ user: "user", password: newPassword })
    })

    logoutAgent(agent)
})