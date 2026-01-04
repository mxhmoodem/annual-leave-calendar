const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Create or get user after Firebase login
router.post('/login', authenticate, async (req, res) => {
    try {
        let user = await User.findOne({ firebaseUid: req.user.uid });
        
        if (!user) {
            // Create new user
            user = new User({
                firebaseUid: req.user.uid,
                email: req.user.email,
                name: req.user.name
            });
            await user.save();
            console.log('New user created:', user.email);
        }
        
        res.json({
            message: 'Login successful',
            user: {
                email: user.email,
                name: user.name,
                totalHolidays: user.totalHolidays
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user info
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user.uid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ email: user.email, name: user.name });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
