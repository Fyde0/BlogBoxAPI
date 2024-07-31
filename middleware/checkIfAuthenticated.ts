import { Request, Response, NextFunction } from "express"

function checkIfAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.session.userId) {
        console.log("Authenticated.")
        next()
    } else {
        // 401 Unauthorized
        console.log("Not authenticated.")
        return res.status(401).json({"error": "You're not logged in."})
    }
}

export default checkIfAuthenticated