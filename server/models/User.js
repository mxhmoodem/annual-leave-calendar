const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    date: { type: String, required: true },
    label: { type: String, default: 'Holiday' },
    color: { type: String, default: '#4ecdc4' },
    type: { type: String, enum: ['holiday', 'sick', 'unpaid'], default: 'holiday' }
});

const userSchema = new mongoose.Schema({
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String },
    totalHolidays: { type: Number, default: 20 },
    holidays: { type: Map, of: holidaySchema, default: {} },
    attendanceData: { type: Map, of: String, default: {} },
    attendanceConfig: {
        requiredDaysType: { type: String, default: 'percentage' },
        requiredDaysValue: { type: Number, default: 100 },
        countBankHolidays: { type: Boolean, default: true },
        countAnnualLeave: { type: Boolean, default: true },
        countSickDays: { type: Boolean, default: true }
    },
    currentAttendanceMonth: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
