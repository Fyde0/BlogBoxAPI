import express from 'express'
import controller from "../controllers/user"
import checkIfAuthenticated from '../middleware/checkIfAuthenticated'
import uploadAvatar from "../middleware/uploadAvatar"

const router = express.Router()

router.post("/register", controller.register)
router.post("/login", controller.login)
router.get("/logout", controller.logout)
router.get("/ping", checkIfAuthenticated, controller.ping)
router.post("/settings", checkIfAuthenticated, controller.changeSettings)
router.patch("/update", checkIfAuthenticated, uploadAvatar, controller.updateUserInfo)

export default router