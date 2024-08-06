import express from 'express'
import controller from "../controllers/user"
import checkIfAuthenticated from '../middleware/checkIfAuthenticated'

const router = express.Router()

router.post("/register", controller.register)
router.post("/login", controller.login)
router.get("/logout", controller.logout)
router.get("/ping", checkIfAuthenticated, controller.ping)
router.post("/settings", checkIfAuthenticated, controller.changeSettings)

export default router