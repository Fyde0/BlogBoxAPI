import express from 'express'
import controller from "../controllers/post"
import checkIfAuthenticated from '../middleware/checkIfAuthenticated'

const router = express.Router()

router.get("/", controller.getAll) // ?amount=&skip=
router.get("/byDateRange/:startDateEpochMs/:endDateEpochMs", controller.getByDateRange)
router.get("/byPostId/:year/:month/:day/:titleId", controller.getByPostId)
router.get("/countByMonth", controller.getCountByMonth)
router.post("/create", checkIfAuthenticated, controller.create)
router.patch("/update/:_id", checkIfAuthenticated, controller.update)
router.delete("/delete/:_id", checkIfAuthenticated, controller.deletePost)

export default router