import { createUser } from '../services/signupService.js';

export const signupUser = async (req, res) => {
    try {
        const { firstname, lastname, username, email, password, bio } = req.body;
        if (!firstname || !lastname || !username || !email || !password) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }
        const user = await createUser({ firstname, lastname, username, email, password, bio });
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            message: 'User registered successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
