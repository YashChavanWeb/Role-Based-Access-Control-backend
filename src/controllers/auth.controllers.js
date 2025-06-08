import User from '../models/User.model.js'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

dotenv.config()

const register = async (req, res) => {

    // get the details:
    const { name, email, password, team } = req.body

    // check for existing email
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({
        message: 'Email already in use'
    });

    // hash the password
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, team, role: 'Junior' })   // default role

    res.status(201).json({ message: 'Registered successfully' });
}

const login = async (req, res) => {

    const { email, password } = req.body

    // check for the email 
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // match the password 
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    // generate the token
    const token = jwt.sign(
        { userId: user._id, role: user.role, team: user.team },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    // return the token
    res.json({ message: 'Login Successful!', token });

}



export { register, login }