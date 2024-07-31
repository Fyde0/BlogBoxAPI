import { Response } from "express"

export function serverError(res: Response, error: any) {
    // 500 Internal Server Error
    console.error(error)
    return res.status(500).json({"error": "Server error."})
}