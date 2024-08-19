import { z } from "zod"
import bcrypt from "bcrypt"

async function validateAndHashPassword(password: string) {

    // Validate password
    const validationResult = z.object({
        password: z
            .string()
            .min(1, { message: "Password required." })
            .min(4, { message: "The password must be between 4 and 50 characters." })
            .max(50, { message: "The password must be between 4 and 50 characters." }),
    })
        .safeParse({ password })

    if (!validationResult.success) {
        throw validationResult.error
    }

    // Hash password
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)
    if (!hash) {
        throw new Error("BCrypt error")
    }
    return hash
}

export default validateAndHashPassword