import bcrypt from "bcryptjs";

const PEPPER = process.env.PEPPER || "your_pepper_value"; // Ensure PEPPER is defined
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(password + PEPPER, salt); // Append PEPPER to the password
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password + PEPPER, hashedPassword); // Compare with PEPPER appended
};
