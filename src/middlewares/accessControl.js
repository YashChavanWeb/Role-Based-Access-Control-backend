import Document from "../models/Document.model.js";
import checkPermissions from '../rbac/permissions.js'


const canAccess = (action) => {

    return async function (req, res, next) {

        // check for the document
        const doc = await Document.findById(req.params.id)

        if (!doc)
            return res
                .status(404).json({ message: "Document not found" })

        // check for the access of document
        const result = checkPermissions(req.user, doc, action)

        if (!result.allowed)
            return res
                .status(403).json({ message: result.reason })

        // if allowed then return document
        req.document = doc;
        next();


    }
}

export default canAccess;