import { createUser } from '../../services/signupService/signupService.js';
import { validatePassword, validateEmail, validateUsername, validateName } from '../../utils/validation.js';

export const signupUser = async (req, res) => {
    try {
        const { firstname, lastname, username, email, password, bio } = req.body;
        
        // Check required fields
        if (!firstname || !lastname || !username || !email || !password) {
            return res.status(400).json({ 
                message: 'All required fields must be provided',
                errors: ['firstname', 'lastname', 'username', 'email', 'password'].filter(field => !req.body[field]).map(field => `${field} is required`)
            });
        }

        // Validate all fields
        const validationErrors = [];
        
        // Validate firstname
        const firstnameValidation = validateName(firstname, 'First name');
        if (!firstnameValidation.isValid) {
            validationErrors.push(...firstnameValidation.errors);
        }
        
        // Validate lastname
        const lastnameValidation = validateName(lastname, 'Last name');
        if (!lastnameValidation.isValid) {
            validationErrors.push(...lastnameValidation.errors);
        }
        
        // Validate username
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
            validationErrors.push(...usernameValidation.errors);
        }
        
        // Validate email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            validationErrors.push(...emailValidation.errors);
        }
        
        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            validationErrors.push(...passwordValidation.errors);
        }
        
        // If there are validation errors, return them
        if (validationErrors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validationErrors
            });
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
