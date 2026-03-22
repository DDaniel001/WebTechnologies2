const mongoose = require('mongoose');

/**
 * Game Schema
 * Defines the structure of a video game entry in the database.
 */
const gameSchema = new mongoose.Schema({
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
    releaseYear: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Game', gameSchema);