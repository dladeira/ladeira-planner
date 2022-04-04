import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    tasks: {
        type: Array,
        default: []
    },
    days: {
        type: Array,
        default: []
    },
    categories: {
        type: Array,
        default: []
    },
    ratings: {
        type: Array,
        default: []
    }
})

export default mongoose.models.User || mongoose.model('User', UserSchema)