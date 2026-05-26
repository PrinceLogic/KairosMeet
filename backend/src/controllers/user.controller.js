import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from "bcrypt";


const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "please provide username and password" });
    }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
        }
        if (bcrypt.compare(password, user.password)) {
            let token = crypto.randomBytes(20).toString('hex');
            user.token = token;
            return user;
            await user.save();
            return res.status(httpStatus.OK).json({ message: "User logged in successfully", token });

        }
    }
    catch (e) {
        res.json({ message: `Error ${e.message}` });
    }

}

const register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name: name,
            username: username,
            password: hashedPassword
        });
        await newUser.save();
        res.status(httpStatus.CREATED).json({ message: " User registered successfully" });

    } catch (e) {
        res.json({ message: `Error ${e.message}` });

    }
}
export { login, register }