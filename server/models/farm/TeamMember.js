const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['worker', 'vet', 'manager', 'other'], required: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    hireDate: Date,
    salary: { type: Number },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    notes: { type: String, trim: true },
}, { timestamps: true });

teamMemberSchema.index({ farm: 1, role: 1 });

module.exports = mongoose.model('TeamMember', teamMemberSchema);