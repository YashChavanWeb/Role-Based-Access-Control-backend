import Document from "../models/Document.model.js";


const createDocument = async (req, res) => {

    const { title, content, sender, sharedWithTeam, editAccessRoles } = req.body;

    const doc = await Document.create({
        title,
        content,
        sender,
        ownerId: req.user.userId,
        team: req.user.team,
        sharedWithTeam,
        editAccessRoles
    });

    res.status(201).json(doc);
}

const getDocument = async (req, res) => {
    res.json(req.document);
};

const updateDocument = async (req, res) => {
    const updates = req.body;
    const updated = await Document.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
};

const deleteDocument = async (req, res) => {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted' });
};

export { createDocument, getDocument, updateDocument, deleteDocument }

