import {Router} from "express"
import { registerUser, loginUser, logoutUser, refreshAccessToken, getAllUsers, getUserById, updateUserData, deleteUserById } from "../controllers/user.controller.js";
import { verifyJWT, verifyIsAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

//public routes:
router.route("/register").post(registerUser); 
router.route("/login").post(loginUser);

//auth routes:
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-session").post(refreshAccessToken);
router.route("/get-all-users").get(verifyJWT, verifyIsAdmin, getAllUsers);
router.route("/get-user/:id").get(verifyJWT, verifyIsAdmin, getUserById);
router.route("/update-user-data/:id").put(verifyJWT, updateUserData);
router.route("/delete-user/:id").delete(verifyJWT, verifyIsAdmin, deleteUserById);


export default router;