import { Router } from "express";
import {registerhandler,Loginhanlder, logout,refreshAccessToken} from "../controllers/user.controller.js"
import {upload} from "../middleware/multer.middleware.js"
import {verifyJWt} from "../middleware/auth.middleware.js"


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerhandler
    )
router.route("/login").post(Loginhanlder)

//secrued routes

router.route("/logout").post(verifyJWt,logout)
router.route("/refresh-token").post(refreshAccessToken)
export default router





