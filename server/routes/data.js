const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Get all user data
router.get('/', authenticate, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user.uid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            name: user.name,
            email: user.email,
            totalHolidays: user.totalHolidays,
            holidays: Object.fromEntries(user.holidays || new Map()),
            attendanceData: Object.fromEntries(user.attendanceData || new Map()),
            attendanceConfig: user.attendanceConfig,
            currentAttendanceMonth: user.currentAttendanceMonth
        });
    } catch (error) {
        console.error('Get data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Save all user data
router.post('/', authenticate, async (req, res) => {
    try {
        const { totalHolidays, holidays, attendanceData, attendanceConfig, currentAttendanceMonth } = req.body;
        
        const updateData = {
            totalHolidays,
            holidays: new Map(Object.entries(holidays || {})),
            attendanceData: new Map(Object.entries(attendanceData || {})),
            attendanceConfig
        };
        
        if (currentAttendanceMonth) {
            updateData.currentAttendanceMonth = currentAttendanceMonth;
        }
        
        const user = await User.findOneAndUpdate(
            { firebaseUid: req.user.uid },
            updateData,
            { new: true, upsert: true }
        );
        
        res.json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Save data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update holidays only
router.put('/holidays', authenticate, async (req, res) => {
    try {
        const { holidays } = req.body;
        
        await User.findOneAndUpdate(
            { firebaseUid: req.user.uid },
            { holidays: new Map(Object.entries(holidays || {})) }
        );
        
        res.json({ message: 'Holidays updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update attendance only
router.put('/attendance', authenticate, async (req, res) => {
    try {
        const { attendanceData, attendanceConfig, currentAttendanceMonth } = req.body;
        
        const updateData = { 
            attendanceData: new Map(Object.entries(attendanceData || {})),
            attendanceConfig 
        };
        
        if (currentAttendanceMonth) {
            updateData.currentAttendanceMonth = currentAttendanceMonth;
        }
        
        await User.findOneAndUpdate(
            { firebaseUid: req.user.uid },
            updateData
        );
        
        res.json({ message: 'Attendance updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update total holidays setting
router.put('/settings', authenticate, async (req, res) => {
    try {
        const { totalHolidays } = req.body;
        
        await User.findOneAndUpdate(
            { firebaseUid: req.user.uid },
            { totalHolidays }
        );
        
        res.json({ message: 'Settings updated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
