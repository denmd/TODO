const express = require('express');
const router = express.Router();
const Project = require('../models/projects');
const Todo = require('../models/todo');
const User = require('../models/User');
const VerifyToken = require('../middleware/verifytoken');



router.post('/new-todo', VerifyToken, async (req, res) => {
   
    const { description } = req.body;
    console.log(description)
    const { projectId } = req.query;
    console.log(projectId)
   

    
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        
        const todo = new Todo({
            description
        });

        await todo.save();

       
        project.todos.push(todo._id);
        await project.save();

        res.status(201).json({ message: 'Todo successfully added to project' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
router.get('/get-all-todos', VerifyToken, async (req, res) => {
   
    const { projectId } = req.query; 
   

    try {
        const project = await Project.findById(projectId).populate('todos');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json({ todos: project.todos });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.put('/update-todo', VerifyToken, async (req, res) => {
    const { todoId } = req.query; 
    const { description, status } = req.body; 
    console.log(description)
    console.log(status)

    try {
       
        const todo = await Todo.findById(todoId);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        
        if (description) todo.description = description;
        if (status) todo.status = status;

      
        await todo.save();

        res.status(200).json({ message: 'Todo successfully updated', todo });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
router.delete('/remove-todo', VerifyToken, async (req, res) => {
    const { todoId } = req.query; 

    try {
       
        const todo = await Todo.findOneAndDelete(todoId);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        await Project.updateMany(
            { todos: todoId },
            { $pull: { todos: todoId } }
        );

        res.status(200).json({ message: 'Todo successfully deleted' });
    } catch (error) {
        res.status(500).json(console.log(error));
    }
});

module.exports = router;