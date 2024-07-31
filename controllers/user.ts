import { Request, Response, NextFunction } from "express"
import bcrypt from "bcrypt"
import { z } from "zod"
//
import { serverError } from "../helpers/serverError"
import IUser, { IUserInfo } from "../interfaces/user"
import User from "../models/user"

// 
// Register
// 
async function register(req: Request, res: Response, next: NextFunction) {
    console.log("Creating user...")

    let user: IUser = { ...req.body, admin: false }

    // Validate username and password

    const validationResult = z.object({
        username: z
            .string()
            .min(1, { message: "Username required." })
            .min(4, { message: "The username must be between 4 and 32 characters." })
            .max(32, { message: "The username must be between 4 and 32 characters." })
            .regex(/^([a-z0-9-_]+)$/, { message: "The username contains invalid characters." }),
        password: z
            .string()
            .min(1, { message: "Password required." })
            .min(4, { message: "The password must be between 4 and 50 characters." })
            .max(50, { message: "The password must be between 4 and 50 characters." }),
    })
        .safeParse({ username: user.username, password: user.password })

    if (!validationResult.success) {
        // 422 Unprocessable Content
        console.log("Invalid credentials.")
        return res.status(422).json({ "error": validationResult.error.issues[0].message })
    }

    // Check if user already exists
    if (await User.exists({ username: user.username }) !== null) {
        // 409 Conflict
        console.log("Username already taken.")
        return res.status(409).json({ "error": "This username is already taken." })
    }

    // Hash password
    const saltRounds = 10
    const hash = await bcrypt.hash(user.password, saltRounds)
    if (!hash) {
        return serverError(res, "BCrypt error.")
    }

    // Create new User
    // Need the interface, Typescript doesn't validate Models
    const newUser = new User<IUser>({
        username: user.username,
        password: hash,
        admin: user.admin
    })

    newUser.save()
        .then(() => {
            // 201 Created
            console.log("User created.")
            return res.status(201).json({ "message": "User created." })
        })
        .catch((error) => { return serverError(res, error) })
}

// 
// Login
// 
async function login(req: Request, res: Response, next: NextFunction) {
    console.log("Logging in user...")

    let { username, password } = req.body

    const validationResult = z.object({
        username: z.string().min(1, { message: "Username required." }),
        password: z.string().min(1, { message: "Password required." })
    }).safeParse({ username: username, password: password })

    if (!validationResult.success) {
        // 422 Unprocessable Content
        console.log("Fields missing.")
        return res.status(422).json({ "error": validationResult.error.issues[0].message })
    }

    // Get and validate user, include password
    const user = await User.findOne<IUser>({ username }).select("+password")
    if (!user) {
        // 401 Unauthorized
        console.log("User not found.")
        return res.status(401).json({ "error": "Wrong username or password." })
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
        // 401 Unauthorized
        console.log("Wrong credentials.")
        return res.status(401).json({ "error": "Wrong username or password." })
    }

    req.session.regenerate((error) => {
        if (error || !user._id) {
            return serverError(res, error)
        }

        // Store user id in session
        req.session.userId = user._id.toString()
        // Save session
        req.session.save((error) => {
            if (error) {
                return serverError(res, error)
            } else {
                const userInfo: IUserInfo = {
                    _id: user._id,
                    username: user.username,
                    admin: user.admin
                }
                // 200 OK
                console.log("User logged in.")
                return res.status(200).json(userInfo)
            }
        })
    })
}

// 
// Logout
// 
function logout(req: Request, res: Response, next: NextFunction) {
    console.log("Logging out user...")

    if (!req.session.userId) {
        // 204 No Content
        console.log("User not logged in")
        return res.status(204).json({ "error": "Not logged in." })
    }

    // Destroy session and save
    // TODO .destroy() instead?
    req.session.userId = null
    req.session.save(function (error) {
        if (error) {
            return serverError(res, error)
        }

        // Regenerate, good practice
        req.session.regenerate(function (error) {
            if (error) {
                return serverError(res, error)
            } else {
                // 200 OK
                console.log("User logged out.")
                return res.status(200).json({ "message": "Logged out." })
            }
        })
    })
}

// 
// Ping
// 
function ping(req: Request, res: Response, next: NextFunction) {
    console.log("Pinging user...")

    // 200 OK
    console.log("Pinged.")
    return res.status(200).json({ "message": "Still logged in." })
}

export default {
    register,
    login,
    logout,
    ping
}