import { Request, Response, NextFunction } from "express"
import bcrypt from "bcrypt"
// Interfaces and models
import IUser from "../interfaces/user"
import User from "../models/user"

// 
// Functions
// 
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

// 
// Register
// 
async function register(req: Request, res: Response, next: NextFunction) {
    console.log("Creating user...")

    let { username, password } = req.body

    // Validate username and password
    const validationError = validateRegistrationCredentials(username, password)
    if (validationError !== "") {
        // 422 Unprocessable Content
        console.log("Invalid credentials.")
        return res.status(422).send(validationError)
    }

    // Check if user already exists
    if (await User.exists({ username }) !== null) {
        // 409 Conflict
        console.log("Username already taken.")
        return res.status(409).send("This username is already taken.")
    }

    // Hash password
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)
    if (!hash) {
        // 500 Internal Server Error
        console.error("BCrypt error.")
        return res.status(500).send("Server error.")
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
            // 201 Created
            console.log("User created.")
            return res.status(201).send("User created.")
        })
        .catch(error => {
            // 500 Internal Server Error
            console.error(error)
            return res.status(500).send("Server error.")
        })
}

// 
// Login
// 
async function login(req: Request, res: Response, next: NextFunction) {
    console.log("Logging in user...")

    let { username, password } = req.body

    // Get and validate user
    const user = await User.findOne({ username })
    if (!user) {
        // 401 Unauthorized
        console.log("User not found.")
        return res.status(401).send("Wrong username or password.")
    }

    // Validate password
    const validPassword = bcrypt.compare(password, user.password)
    if (!validPassword) {
        // 401 Unauthorized
        console.log("Wrong credentials.")
        return res.status(401).send("Wrong username or password.")
    }

    req.session.regenerate((error) => {
        if (error) {
            // 500 Internal Server Error
            console.error(error)
            return res.status(500).send("Server error.")
        }

        // Store user id in session
        req.session.userId = user._id.toString()
        // Save session
        req.session.save((error) => {
            if (error) {
                // 500 Internal Server Error
                console.error(error)
                return res.status(500).send("Server error.")
            } else {
                // 200 OK
                console.log("User logged in.")
                return res.status(200).send("Logged in.")
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
        return res.status(204).send("Not logged in.")
    }

    req.session.userId = null

    req.session.save(function (error) {
        if (error) {
            // 500 Internal Server Error
            console.error(error)
            return res.status(500).send("Server error.")
        }

        // Regenerate, good practice
        req.session.regenerate(function (err) {
            if (error) {
                // 500 Internal Server Error
                console.error(error)
                return res.status(500).send("Server error.")
            } else {
                // 200 OK
                console.log("User logged out.")
                return res.status(200).send("Logged out.")
            }
        })
    })
}

export default {
    register,
    login,
    logout
}