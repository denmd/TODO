const express = require('express');
const router = express.Router();
const Project = require('../models/projects');
const User = require('../models/User');
const VerifyToken=require('../middleware/verifytoken')


router.post('/create-project',VerifyToken , async (req, res) => {
    const { title } = req.body;
    const userId = req.user.id; 

    try {

        const project = new Project({ title });
        await project.save();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.projects.push(project);
        await user.save();

        res.status(201).json("successfully created");
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.get('/get-projects',VerifyToken , async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('projects');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const projects = await Project.find({ _id: { $in: user.projects } });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/update-project', VerifyToken, async (req, res) => {
    const { projectId } = req.query;
    const { title } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        project.title = title;
        await project.save();

        res.status(200).json({ message: 'Project title updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


module.exports = router;
