const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'complete'], default: 'pending' },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now }
});

todoSchema.pre('save', function(next) {
    this.updatedDate = Date.now();
    next();
});

module.exports = mongoose.model('Todo', todoSchema);
