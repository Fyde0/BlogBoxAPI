import express from 'express'
import controller from "../controllers/blogSettings"
import checkIfAdmin from "../middleware/checkIfAdmin"

const router = express.Router()

router.get("/settings", controller.getBlogSettings)
router.patch("/settings", checkIfAdmin, controller.changeBlogSettings)

export default router