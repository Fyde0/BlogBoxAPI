import { Request, Response, NextFunction } from "express"
import bcrypt from "bcrypt"
import User from "../models/user"

const register = (req: Request, res: Response, next: NextFunction) => {
    console.log("Creating user...")

    let { username, password } = req.body

    // TODO Validation
    // Check if not empty
    // Check that the username doesn't already exist
    // Check username and password requirements

    const saltRounds = 10
    bcrypt.hash(password, saltRounds, function (err, hash) {

        err && console.error("BCrypt error.")

        const newUser = new User({
            username: username,
            password: hash
        })

        newUser.save()
            .then(user => {
                console.log("User created.")
                return res.status(201).json({ "message": "User created" })
            })
            .catch(error => {
                console.error(error.message)
                return res.status(500).json({ "message": "Couldn't create user" })
            })
    })
}

const login = (req: Request, res: Response, next: NextFunction) => {

    let { username, password } = req.body

    console.log("Logging in user...")

    User.findOne({ username })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, function (err, result) {
                    if (result) {
                        console.info("User logged in.")
                        // TODO Implement JWT
                        return res.status(200).json({ username: user.username })
                    } else {
                        console.log("Wrong credentials.")
                        return res.status(401).json({ "message": "Wrong username or password" })
                    }
                })
            } else {
                console.log("User not found.")
                return res.status(404).json({ "message": "User not found" })
            }
        })
        .catch((error) => {
            console.error(error.message)
            return res.status(500).json({ "message": "Server error" })
        })

}

export default {
    register,
    login
}