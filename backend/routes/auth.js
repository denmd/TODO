const express = require('express');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const VerifyToken=require('../middleware/verifytoken')

const secretKey = process.env.JWT_SECRET_KEY
 
router.post('/register', async (req, res) => {
   
    const { username,  password } = req.body;
    try {
        let user = await User.findOne({ username});
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ username, password });
        await user.save();

        

        res.status(201).json("user registered successfully");
    } catch (error) {
        res.status(500).json(console.log(error));
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

      
        const payload = { id: user._id };
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/user', VerifyToken, async (req, res) => {
    const userId = req.user.id; 
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ username: user.username });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;
