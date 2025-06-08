import { Router } from "express";
import verifyToken from "../middlewares/auth.js";
import restrictTo from '../middlewares/restrictTo.js'
import updateUserRole from "../controllers/user.controllers.js";

const router = Router()

router.patch('/:id/role', verifyToken, restrictTo('Head'), updateUserRole)

export default router