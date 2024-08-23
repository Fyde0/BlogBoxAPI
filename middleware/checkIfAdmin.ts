import { Request, Response, NextFunction } from "express"
import IUser from "../interfaces/user"
import User from "../models/user"

function checkIfAdmin(req: Request, res: Response, next: NextFunction) {

    User.findOne<IUser>({ _id: req.session.userId })
        .select("+admin")
        .then(user => {
            if (!user) {
                // 401 Unauthorized
                console.log("User doesn't exist in isAdmin middleware.")
                return res.status(401).json({ "error": "Invalid credentials." })
            }
            if (user.admin === true) {
                next()
            } else {
                // 401 Unauthorized
                console.log("Unauthorized.")
                return res.status(401).json({"error": "Unauthorized."})
            }
        })
}

export default checkIfAdmin