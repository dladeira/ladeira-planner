import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    ibCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IbCourse'
    }],
    superlatives: {
        type: Object,
        default: {}
    },
    admin: Boolean,
    sex: { // -1 None, 0 Male, 1 Female
        type: Number,
        default: -1
    },
    teacher: {
        type: Boolean,
        default: false
    }
})

export default mongoose.models.User || mongoose.model('User', UserSchema)