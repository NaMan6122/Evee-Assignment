import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({
    limit: "500kb",
}));

app.use(express.urlencoded({
    limit: "500kb",
    extended: true,
}));

app.use(cookieParser());

//routes:
import userRouter from "./src/routes/user.routes.js";
app.use("/api/v1/users", userRouter);


export { app }