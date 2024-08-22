import request from "supertest"
import app from "../../app"
import { connectAndInitDB, closeDB, registerAgent, loginAgent, requestHeaders, createPost, logoutAgent, getPost } from "../../helpers/tests"
import { isIAllPosts } from "../../interfaces/allPosts"
import IPost, { isIPost } from "../../interfaces/post"
import { isIPostsCountByMonthArray } from "../../interfaces/postsCountByMonth"

beforeEach(async () => {
    return connectAndInitDB()
})

afterEach(async () => {
    return closeDB()
})

describe("POST /posts/create", () => {

    test("should fail creating a post with 401 if not logged in", async () => {
        const agent = request.agent(app)

        const res = await agent
            .post("/posts/create")
            .field("post", JSON.stringify(
                { title: "title", content: "content" }
            ))

        expect(res.statusCode).toBe(401)
    })

    test.each([
        { name: "title missing", post: { content: "content" } },
        { name: "content missing", post: { title: "title" } },
    ])("should fail creating a post with 422 on $name", async ({ post }) => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)

        const res = await agent
            .post("/posts/create")
            .field("post", JSON.stringify(post))

        expect(res.statusCode).toBe(422)
    })

    test("should create a post and return the postId", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)

        const res = await agent
            .post("/posts/create")
            .field("post", JSON.stringify(
                { title: "title", content: "content" }
            ))

        expect(res.statusCode).toBe(201)
        expect(typeof res.body === "string").toBe(true)
    })
})

describe("PATCH /posts/update", () => {

    test("should fail updating a post with 401 when not logged in", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)
        const postId = await createPost(agent)
        const postObj = await getPost(agent, postId)
        await logoutAgent(agent)

        const res = await agent
            .patch("/posts/update/" + postObj._id)
            .field("post", JSON.stringify({ title: "title", content: "content" }))

        expect(res.statusCode).toBe(401)
    })

    test.each([
        { name: "title missing", updatedPost: { content: "content", author: undefined } },
        { name: "content missing", updatedPost: { title: "title", author: undefined } },
    ])("should fail updating a post with 422 on $name", async ({ updatedPost }) => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)
        const postId = await createPost(agent)
        const post = await getPost(agent, postId)

        const res = await agent
            .patch("/posts/update/" + post._id)
            .field("post", JSON.stringify({ ...updatedPost, author: post.author }))

        expect(res.statusCode).toBe(422)
    })

    test("should fail updating a post with 422 on invalid _id", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)
        const postId = await createPost(agent)
        const post = await getPost(agent, postId)
        const newPost: IPost = {
            title: "new title",
            content: "new content",
            author: post.author,
            tags: ["tag"]
        }

        const res = await agent
            .patch("/posts/update/" + "wrongId")
            .field("post", JSON.stringify(newPost))

        expect(res.statusCode).toBe(422)
    })

    test("should fail updating a post with 404 when post doesn't exist", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)
        const postId = await createPost(agent)
        const post = await getPost(agent, postId)
        const newPost: IPost = {
            title: "new title",
            content: "new content",
            author: post.author,
            tags: ["tag"]
        }

        const res = await agent
            // wrong _id (24 char hex string)
            .patch("/posts/update/" + "000000000000000000000000")
            .field("post", JSON.stringify(newPost))

        expect(res.statusCode).toBe(404)
    })

    test("should fail updating a post with 403 when not the author", async () => {
        const agent = request.agent(app)

        await agent
            .post("/users/register")
            .set(requestHeaders)
            .send({ username: "notuser", password: "notpass" })
        await agent
            .post("/users/login")
            .set(requestHeaders)
            .send({ username: "notuser", password: "notpass" })
        const postId = await createPost(agent)
        const post = await getPost(agent, postId)
        await logoutAgent(agent)

        await registerAgent(agent)
        await loginAgent(agent)
        const newPost: IPost = {
            title: "new title",
            content: "new content",
            author: post.author,
            tags: ["tag"]
        }

        const res = await agent
            .patch("/posts/update/" + post._id)
            .field("post", JSON.stringify(newPost))

        expect(res.statusCode).toBe(403)
    })

    test("should update the post", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)
        const postId = await createPost(agent)
        const post = await getPost(agent, postId)
        const newPost: IPost = {
            title: "new title",
            content: "new content",
            author: post.author,
            tags: ["tag"]
        }

        const res = await agent
            .patch("/posts/update/" + post._id)
            .field("post", JSON.stringify(newPost))

        expect(res.statusCode).toBe(201)
        const updatedPost = await getPost(agent, res.body)
        expect(updatedPost.title).toBe(newPost.title)
        expect(updatedPost.content).toBe(newPost.content)
        expect(updatedPost.tags[0]).toBe(newPost.tags[0])
        expect(updatedPost.author.username).toBe(newPost.author.username)
    })
})

describe("DELETE /posts/delete", () => {

    test("should fail deleting a post with 401 when not logged in", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)
        const postId = await createPost(agent)
        const postObj = await getPost(agent, postId)
        await logoutAgent(agent)

        const res = await agent
            .delete("/posts/delete/" + postObj._id)
            .set(requestHeaders)

        expect(res.statusCode).toBe(401)
    })

    test("should fail deleting a post with 422 on invalid _id", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)
        await createPost(agent)

        const res = await agent
            .delete("/posts/delete/" + "wrongId")
            .set(requestHeaders)

        expect(res.statusCode).toBe(422)
    })

    test("should fail deleting a post with 404 when post doesn't exist", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)
        await createPost(agent)

        const res = await agent
            // wrong _id (24 char hex string)
            .delete("/posts/delete/" + "000000000000000000000000")
            .set(requestHeaders)

        expect(res.statusCode).toBe(404)
    })

    test("should fail deleting a post with 403 when not the author", async () => {
        const agent = request.agent(app)

        await agent
            .post("/users/register")
            .set(requestHeaders)
            .send({ username: "notuser", password: "notpass" })
        await agent
            .post("/users/login")
            .set(requestHeaders)
            .send({ username: "notuser", password: "notpass" })
        const postId = await createPost(agent)
        const post = await getPost(agent, postId)
        await logoutAgent(agent)

        await registerAgent(agent)
        await loginAgent(agent)

        const res = await agent
            .delete("/posts/delete/" + post._id)
            .set(requestHeaders)

        expect(res.statusCode).toBe(403)
    })

    test("should delete the post", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)
        const postId = await createPost(agent)
        const post = await getPost(agent, postId)

        const res = await agent
            .delete("/posts/delete/" + post._id)
            .set(requestHeaders)

        expect(res.statusCode).toBe(200)

        const resGet = await agent
            .get("/posts/byPostId/" + post._id)
            .set(requestHeaders)

        expect(resGet.statusCode).toBe(404)
    })
})

describe("GET /posts", () => {

    test("should get the latest 10 posts (catch all)", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)

        for (let i = 1; i <= 11; i++) {
            await createPost(agent)
        }

        const res = await agent
            .get("/posts")
            .set(requestHeaders)

        expect(res.statusCode).toBe(200)
        expect(isIAllPosts(res.body)).toBe(true)
        expect(res.body.posts.length).toBe(10)
    })

    test("should get the latest 3 posts", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)

        for (let i = 1; i <= 4; i++) {
            await createPost(agent)
        }

        const res = await agent
            .get("/posts")
            .set(requestHeaders)
            .query({ "count": 3 })

        expect(res.statusCode).toBe(200)
        expect(isIAllPosts(res.body)).toBe(true)
        expect(res.body.posts.length).toBe(3)
    })

    test("should get posts but skip 2", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)

        for (let i = 1; i <= 5; i++) {
            await createPost(agent)
        }

        const res = await agent
            .get("/posts")
            .set(requestHeaders)
            .query({ "skip": 2 })

        expect(res.statusCode).toBe(200)
        expect(isIAllPosts(res.body)).toBe(true)
        expect(res.body.posts.length).toBe(3)
    })

    test("should get posts between date range", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)

        // create 3 posts before everything
        for (let i = 1; i <= 3; i++) {
            await createPost(agent)
        }

        const date1 = new Date

        // create 3 posts between date1 and date2
        for (let i = 1; i <= 3; i++) {
            await createPost(agent)
        }

        const date2 = new Date

        // create 3 posts after date2
        for (let i = 1; i <= 3; i++) {
            await createPost(agent)
        }

        const res = await agent
            .get("/posts")
            .set(requestHeaders)
            .query({ "startDate": date1.getTime(), "endDate": date2.getTime() })

        expect(res.statusCode).toBe(200)
        expect(isIAllPosts(res.body)).toBe(true)
        expect(res.body.posts.length).toBe(3)
    })
})

describe("GET /posts/byPostId", () => {

    test("should fail getting post with 404 on invalid postId", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)

        await agent
            .post("/posts/create")
            .field("post", JSON.stringify(
                { title: "title", content: "content" }
            ))

        const res = await agent
            .get("/posts/byPostId/" + "notRight")
            .set(requestHeaders)

        expect(res.statusCode).toBe(404)
    })

    test("should get post by postId", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)

        const createRes = await agent
            .post("/posts/create")
            .field("post", JSON.stringify(
                { title: "title", content: "content" }
            ))

        const postId = createRes.body
        console.log(postId)

        const res = await agent
            .get("/posts/byPostId/" + postId)
            .set(requestHeaders)

        expect(res.statusCode).toBe(200)
        expect(isIPost(res.body)).toBe(true)
    })
})

describe("GET /posts/countByMonth", () => {

    test("should get post count grouped by month", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)

        const date = new Date

        for (let i = 1; i <= 3; i++) {
            await createPost(agent)
        }

        const res = await agent
            .get("/posts/countByMonth")
            .set(requestHeaders)

        expect(res.statusCode).toBe(200)
        expect(isIPostsCountByMonthArray(res.body)).toBe(true)

        const countObj = res.body[0]
        expect(countObj._id.year === date.getFullYear()).toBe(true)
        expect(countObj._id.month === date.getMonth() + 1).toBe(true)
        expect(countObj.count).toBe(3)
    })
})

describe("GET /posts/tags", () => {

    test("should get all tags", async () => {
        const agent = request.agent(app)
        await registerAgent(agent)
        await loginAgent(agent)

        await createPost(agent, ["tag1"])
        await createPost(agent, ["tag2"])

        const res = await agent
            .get("/posts/tags")
            .set(requestHeaders)

        expect(res.statusCode).toBe(200)
        expect(res.body.includes("tag1")).toBe(true)
        expect(res.body.includes("tag2")).toBe(true)
    })
})