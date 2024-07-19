import express from 'express'
import controller from "../controllers/post"

const router = express.Router()

router.get('/', controller.getAll)
// get /byId/:id
router.post('/create', controller.create)
// put /update/:id
// delete /delete/:id

export default router