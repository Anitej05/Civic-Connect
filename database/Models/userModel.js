const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    _id: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ["citizen", "admin"],
        required: true,
        default: "citizen"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false, 
    timestamps: false 
});

const User = mongoose.model("User", userSchema);

module.exports = User;
