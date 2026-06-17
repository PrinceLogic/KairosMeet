import { Router } from "express";
import { login, register, getUserInfo } from "../controllers/user.controller.js";
const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/get-user-info").get(getUserInfo);
router.route("add_all_activity");
router.route("get_all_activity");
export default router;