import express from 'express'
import controller from "../controllers/post"
import checkIfAuthenticated from '../middleware/checkIfAuthenticated'

const router = express.Router()

router.get('/', controller.getAll)
router.get('/byId/:year/:month/:day/:titleId', controller.getById)
router.post('/create', checkIfAuthenticated, controller.create)
// put /update/:id
// delete /delete/:id

export default router