import User from "../models/User.model.js";

const updateUserRole = async (req, res) => {

    // get user id and role
    const { id } = req.params;
    const { role } = req.body;

    // find and update the role
    await User.findByIdAndUpdate(id, { role });
    res.json({ message: 'Role updated' });
};

export default updateUserRole