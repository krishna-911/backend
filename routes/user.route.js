import { Router } from "express";
import { userSignup, userSignin } from "./controllers/user.controller.js"

const router = Router()

Router.route("/signup").post(userSignup)

Router.route("/signin").post(userSignin)

export default router