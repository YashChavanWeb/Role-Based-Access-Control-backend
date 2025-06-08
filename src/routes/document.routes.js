import { Router } from "express";
import verifyToken from '../middlewares/auth.js'
import canAccess from '../middlewares/accessControl.js'
import { createDocument, getDocument, updateDocument, deleteDocument } from "../controllers/document.controllers.js";

const router = Router()

router.use(verifyToken)

router.post('/', createDocument)
router.get('/:id', canAccess('view'))
router.put('/:id', canAccess('edit'), updateDocument);
router.delete('/:id', canAccess('delete'), deleteDocument);

export default router