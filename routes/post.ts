import express from 'express'
import controller from "../controllers/post"
import checkIfAuthenticated from '../middleware/checkIfAuthenticated'

const router = express.Router()

router.get('/', controller.getAll)
// get /byId/:id
router.post('/create', checkIfAuthenticated, controller.create)
// put /update/:id
// delete /delete/:id

export default router