import connectDB from "./src/dbConfig/dbConfig.js";
import { app } from "./app.js";
import dotenv from "dotenv";


dotenv.config({
    path: "./env"
});

connectDB()
.then(() => {
    app.on(process.env.PORT, (error) => {
        console.log("Some Error Occured:", error);
        throw error;
    });
    app.listen(process.env.PORT || 2000, () => {
        console.log(`Server is running on port ${process.env.PORT || 2000}`)
    });
})
.catch((err) => console.log("Server Connection Failed!!", err))