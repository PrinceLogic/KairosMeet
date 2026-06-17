import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";

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
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            let token = crypto.randomBytes(20).toString('hex');
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({
                message: "User logged in successfully",
                token,
                name: user.name,
                username: user.username
            });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
        }
    }
    catch (e) {
        res.status(500).json({ message: `Error ${e.message}` });
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
        res.status(httpStatus.CREATED).json({ message: "User registered successfully" });

    } catch (e) {
        res.status(500).json({ message: `Error ${e.message}` });
    }
}

const getUserInfo = async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "No token provided" });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }

        return res.status(httpStatus.OK).json({
            name: user.name,
            username: user.username
        });
    } catch (e) {
        res.status(500).json({ message: `Error ${e.message}` });
    }
}

export { login, register, getUserInfo };