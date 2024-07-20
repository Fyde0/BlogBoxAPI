import { Request, Response, NextFunction } from "express"
import bcrypt from "bcrypt"
import IUser from "../interfaces/user"
import User from "../models/user"

function validateRegistrationCredentials(username: string, password: string): string {
    if (!username || username === '') { return "Username required." }
    if (!password || password === '') { return "Password required." }
    if (username.length < 4 || username.length > 32) {
        return "The username needs to be between 4 and 32 characters."
    }
    if (password.length < 4 || password.length > 50) {
        return "The password needs to be between 4 and 50 characters."
    }
    if (!/^([a-z0-9-_]+)$/i.test(username)) {
        return "The username contains invalid characters."
    }
    return ""
}

async function register(req: Request, res: Response, next: NextFunction) {
    console.log("Creating user...")

    let { username, password } = req.body

    // Validate username and password
    const validationError = validateRegistrationCredentials(username, password)
    if (validationError !== "") {
        // 422 Unprocessable Content
        console.log("Invalid credentials.")
        return res.status(422).json({ "error": validationError })
    }

    // Check if user already exists
    if (await User.exists({ username }) !== null) {
        // 409 Conflict
        console.log("Username already taken.")
        return res.status(409).json({ "error": "This username is already taken." })
    }

    // Hash password
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)
    if (!hash) {
        console.error("BCrypt error.")
        return res.status(500).json({ "error": "Server error" })
    }

    // Create new User
    // Need the interface, Typescript doesn't validate Models
    const newUser = new User<IUser>({
        username: username,
        password: hash,
        admin: false
    })

    newUser.save()
        .then(user => {
            console.log("User created.")
            return res.status(201).json({ "message": "User created" })
        })
        .catch(error => {
            console.error(error)
            return res.status(500).json({ "error": "Server error" })
        })
}

async function login(req: Request, res: Response, next: NextFunction) {
    console.log("Logging in user...")

    let { username, password } = req.body

    // Get and validate user
    const user = await User.findOne({ username })
    if (!user) {
        console.log("User not found.")
        return res.status(404).json({ "error": "User not found" })
    }

    // Validate password
    const validPassword = bcrypt.compare(password, user.password)
    if (!validPassword) {
        console.log("Wrong credentials.")
        return res.status(401).json({ "error": "Wrong username or password" })
    }

    req.session.regenerate((error) => {
        if (error) {
            console.error(error)
            return res.status(500).json({ "error": "Server error" })
        }

        // Store user id in session
        req.session.userId = user._id.toString()
        // Save session
        req.session.save((error) => {
            if (error) {
                console.error(error)
                return res.status(500).json({ "error": "Server error" })
            } else {
                console.log("User logged in.")
                return res.status(200).json({ "message": "success" })
            }
        })
    })
}

function logout(req: Request, res: Response, next: NextFunction) {
    console.log("Logging out user...")

    if (!req.session.userId) {
        // 204 No Content
        console.log("User not logged in")
        return res.status(204).json({ "message": "Not logged in" })
    }

    req.session.userId = null
    req.session.save(function (error) {
        if (error) {
            console.error(error)
            return res.status(500).json({ "error": "Server error" })
        }

        // Regenerate, good practice
        req.session.regenerate(function (err) {
            if (error) {
                console.error(error)
                return res.status(500).json({ "error": "Server error" })
            } else {
                console.log("User logged out.")
                return res.status(200).json({ "message": "success" })
            }
        })
    })
}

export default {
    register,
    login,
    logout
}