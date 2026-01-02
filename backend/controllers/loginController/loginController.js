import { loginUser } from "../../services/loginService/loginService.js";
import { validateEmail } from "../../utils/validation.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Check required fields
  if (!email || !password) {
    return res.status(400).json({ 
      message: "Email and password are required",
      errors: [
        ...(!email ? ["Email is required"] : []),
        ...(!password ? ["Password is required"] : [])
      ]
    });
  }

  // Validate email format
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return res.status(400).json({
      message: "Invalid email format",
      errors: emailValidation.errors
    });
  }

  // Basic password check (not full validation since it's login)
  if (password.length < 8) {
    return res.status(400).json({
      message: "Invalid password format",
      errors: ["Password must be at least 8 characters long"]
    });
  }

  try {
    const { user, token } = await loginUser(email, password);

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
