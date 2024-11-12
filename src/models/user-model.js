import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true, 
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    
    refreshToken: {
        type: String,
    }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if(this.isModified("password")){ 
        this.password = await bcrypt.hash(this.password, 10); 
    }
});

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function() {
    const token = jwt.sign({
        _id: this._id.toString(),
        email: this.email,
        fullName: this.fullName,
        username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
    console.log(`accessToken: ${token}`);
    return token;
};

userSchema.methods.generateRefreshToken = async function() {
    const token = jwt.sign({
        _id: this._id.toString(),
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
    console.log(`refreshToken: ${token}`);
    return token;
};

export const User = mongoose.model("User", userSchema);

