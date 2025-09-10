const mongoose = require("mongoose");
const reportSchema = new mongoose.Schema({
    user_id: {
        type: String, 
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    urgency: {
        type: String,
        required: true
    },
    assigned_department: {
        type: String,
        required: true
    },
    original_text: {
        type: String,
        default: null
    },
    image_url: {
        type: String,
        default: null
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], 
            required: true
        }
    },
    status: {
        type: String,
        enum: ["Submitted", "In Progress", "Resolved"],
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});


reportSchema.index({ location: "2dsphere" });

reportSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
