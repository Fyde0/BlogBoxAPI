import { Request, Response, NextFunction } from "express"

function checkIfAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.session.userId) {
        console.log("Authenticated.")
        next()
    } else {
        console.log("Not authenticated.")
        return res.status(401).json({ "error": "Unauthorized" })
    }
}

export default checkIfAuthenticated