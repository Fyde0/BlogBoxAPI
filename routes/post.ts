import express from 'express'
import controller from "../controllers/post"
import checkIfAuthenticated from '../middleware/checkIfAuthenticated'
import uploadThumbnail from "../middleware/uploadThumbnail"

const router = express.Router()

router.get("/", controller.getAll) // ?startDate=&endDate=&sort=&skip=&count=
router.get("/byPostId/:year/:month/:day/:titleId", controller.getByPostId)
router.get("/countByMonth", controller.getCountByMonth)
router.get("/tags", controller.getTags)
router.post("/create", checkIfAuthenticated, uploadThumbnail, controller.create)
router.patch("/update/:_id", checkIfAuthenticated, uploadThumbnail, controller.update)
router.delete("/delete/:_id", checkIfAuthenticated, controller.deletePost)

export default router