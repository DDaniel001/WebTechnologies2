const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Links the game to a specific user
    },
    title: {
        type: String,
        required: [true, 'Please add a game title'],
        unique: true,
        trim: true
    },
    platform: {
        type: String,
        required: [true, 'Please specify the platform'],
        enum: ['PC', 'PS5', 'Xbox', 'Switch', 'PS4']
    },
    genre: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
    status: {
        type: String,
        enum: ['Playing', 'Completed', 'Backlog'],
        default: 'Backlog'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Game', gameSchema);