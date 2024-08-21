import { Request, Response, NextFunction } from "express"
import bcrypt from "bcrypt"
import { z, ZodError } from "zod"
//
import { serverError } from "../helpers/serverError"
import IUser, { isIUserInfo, IUserInfo } from "../interfaces/user"
import { defaultUserSettings, isIUserSettings } from "../interfaces/userSettings"
import User from "../models/user"
import validateAndHashPassword from "../helpers/validateAndHashPassword"

// 
// Register
// 
async function register(req: Request, res: Response, next: NextFunction) {
    console.log("Creating user...")

    let { username, password } = req.body

    // Validate username and password

    const validationResult = z.object({
        username: z
            .string()
            .min(1, { message: "Username required." })
            .min(4, { message: "The username must be between 4 and 32 characters." })
            .max(32, { message: "The username must be between 4 and 32 characters." })
            .regex(/^([a-z0-9-_]+)$/, { message: "The username contains invalid characters." }),
    })
        .safeParse({ username })

    if (!validationResult.success) {
        // 422 Unprocessable Content
        console.log("Invalid credentials.")
        return res.status(422).json({ "error": validationResult.error.issues[0].message })
    }

    // Check if user already exists
    if (await User.exists({ username }) !== null) {
        // 409 Conflict
        console.log("Username already taken.")
        return res.status(409).json({ "error": "This username is already taken." })
    }


    validateAndHashPassword(password)
        .then(hash => {

            // Create new User
            // Need the interface, Typescript doesn't validate Models
            const newUser = new User<IUser>({
                username: username,
                password: hash,
                settings: defaultUserSettings,
                admin: false
            })

            newUser.save()
                .then(() => {
                    // 201 Created
                    console.log("User created.")
                    return res.status(201).json({ "message": "User created." })
                })
                .catch((error) => { return serverError(res, error) })

        })
        .catch(error => {
            if (error instanceof ZodError) {
                // 422 Unprocessable Content
                console.log("Invalid password.")
                return res.status(422).json({ "error": error.issues[0].message })
            } else {
                return serverError(error, error.message)
            }
        })
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
    // <IUser> works normally but not for destructuring
    // so we need to get the document and then convert it
    const userDoc = await User.findOne({ username }).select("+password +settings +admin")
    if (!userDoc) {
        // 401 Unauthorized
        console.log("User not found.")
        return res.status(401).json({ "error": "Wrong username or password." })
    }

    const user = userDoc.toObject()

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
                // need the _id for checks in client
                const { password, settings, admin, ...userInfo } = user
                const userSettings = user.settings
                // 200 OK
                console.log("User logged in.")
                return res.status(200).json({ userInfo, userSettings, admin })
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

    User.findOne<IUser>({ _id: req.session.userId })
        .select("+admin")
        .then(user => {
            if (!user) {
                // 401 Unauthorized
                console.log("User doesn't exist in ping.")
                return res.status(401).json({ "error": "Invalid credentials." })
            }
            // 200 OK
            console.log("Pinged.")
            return res.status(200).json({ isAdmin: user.admin })
        })
}

// 
// Change settings
// 
async function changeSettings(req: Request, res: Response, next: NextFunction) {
    console.log("Changing settings...")

    if (!isIUserSettings(req.body)) {
        // 422 Unprocessable Content
        console.log("Invalid object.")
        return res.status(422).json({ "error": "Invalid settings." })
    }

    const _id = req.session.userId
    const userSettings = req.body

    // Don't need settings cause we're overwriting anyway
    const user = await User.findOne({ _id })
    if (!user) {
        // 401 Unauthorized
        console.log("User not found.")
        return res.status(401).json({ "error": "User not found" })
    }

    user.set("settings", userSettings)

    user.save()
        .then(user => {
            if (!user) {
                return serverError(res, "Change settings error")
            }
            console.log("Settings updated.")
            return res.status(200).json(user.settings)
        })
        .catch((error) => { return serverError(res, error) })
}

// 
// Update user info
// 
async function updateUserInfo(req: Request, res: Response, next: NextFunction) {
    console.log("Updating user info...")

    const _id = req.session.userId
    const avatarFilename = req.file?.filename
    const newUserInfo = req.body

    const user = await User.findOne({ _id })
    if (!user) {
        // 401 Unauthorized
        console.log("User not found.")
        return res.status(401).json({ "error": "User not found" })
    }

    const validationResult = z.object({
        name: z.string()
            .max(50, { message: "Your name can't be longer than 50 characters." })
            .optional(),
        about: z.string()
            .max(500, { message: "Your About me field can't be longer than 500 characters." })
            .optional(),
    }).safeParse({
        name: newUserInfo.name,
        about: newUserInfo.about
    })

    if (!validationResult.success) {
        // 422 Unprocessable Content
        console.log("Validation error.")
        return res.status(422).json({ "error": validationResult.error.issues[0].message })
    }

    user.set({ ...newUserInfo })

    if (avatarFilename) {
        user.set("avatar", avatarFilename)
    }

    if (newUserInfo.deleteAvatar) {
        user.set("avatar", undefined)
    }

    user.save()
        .then((user) => {
            if (!user) {
                return serverError(res, "Update profile error")
            }
            const updatedUserInfo = user.toObject() as IUserInfo
            console.log("Profile updated.")
            return res.status(200).json(updatedUserInfo)
        })
        .catch((error) => { return serverError(res, error) })
}

// 
// Change password
// 
async function changePassword(req: Request, res: Response, next: NextFunction) {
    console.log("Changing password...")

    const { oldPassword, newPassword } = req.body

    const validationResult = z.object({
        oldPassword: z.string().min(1, { message: "Old password required." }),
        newPassword: z.string().min(1, { message: "New password required." })
    }).safeParse({ oldPassword, newPassword })

    if (!validationResult.success) {
        // 422 Unprocessable Content
        console.log("Fields missing.")
        return res.status(422).json({ "error": validationResult.error.issues[0].message })
    }

    const user = await User.findOne({ _id: req.session.userId })
        .select("+password")
    if (!user) {
        // 401 Unauthorized
        console.log("User not found.")
        return res.status(401).json({ "error": "Credentials invalid." })
    }

    // Validate password
    const validPassword = await bcrypt.compare(oldPassword, user.password)
    if (!validPassword) {
        // 401 Unauthorized
        console.log("Wrong credentials.")
        return res.status(401).json({ "error": "Wrong password." })
    }

    validateAndHashPassword(newPassword)
        .then(newHash => {

            user.set("password", newHash)

            user.save()
                .then(user => {
                    if (!user) {
                        return serverError(res, "Change password error")
                    }
                    console.log("Password updated.")
                    return res.status(200).json({ "message": "Password changed." })
                })
                .catch((error) => { return serverError(res, error) })
        })
        .catch(error => {
            if (error instanceof ZodError) {
                // 422 Unprocessable Content
                console.log("Invalid password.")
                return res.status(422).json({ "error": error.issues[0].message })
            } else {
                return serverError(error, error.message)
            }
        })
}

export default {
    register,
    login,
    logout,
    ping,
    changeSettings,
    updateUserInfo,
    changePassword
}