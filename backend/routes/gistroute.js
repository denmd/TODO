const express = require('express');
const fs = require('fs');
const path = require('path');  
const Project = require('../models/projects');
const router = express.Router();


function generateTaskList(tasks, status) {
    return tasks.map(task => `- [${status === 'complete' ? 'x' : ' '}] ${task.description}`).join('\n');
}

router.post('/export-summary', async (req, res) => {
    const { projectId } = req.query;

    try {
        const project = await Project.findById(projectId).populate('todos');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const completedTodos = project.todos.filter(todo => todo.status === 'complete');
        const pendingTodos = project.todos.filter(todo => todo.status === 'pending');

        const gistContent = `
# ${project.title}

**Summary:** ${completedTodos.length} / ${project.todos.length} completed.

## Pending Todos
${generateTaskList(pendingTodos, 'pending')}

## Completed Todos
${generateTaskList(completedTodos, 'complete')}
`;
       const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                description: `${project.title} Summary`,
                public: false,
                files: {
                    [`${project.title}.md`]: {
                        content: gistContent,
                    },
                },
            }),
        });

        const data = await response.json();

        const exportDir = path.join(__dirname, '..', 'exports');
      
        res.status(201).json({ message: 'Gist created successfully', url: data.html_url, fileContent: gistContent, fileName: `${project.title}.md` });
    } catch (error) {
        res.status(500).json(console.log(error));
    }
});

module.exports = router;
