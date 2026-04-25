const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });
UserSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};
module.exports = mongoose.model('User', UserSchema);
