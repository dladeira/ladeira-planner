import mongoose from 'mongoose'

const IbCourseSchema = new mongoose.Schema({
    name: String,
    group: Number,
    hl: Boolean
})

export default mongoose.models.IbCourse || mongoose.model('IbCourse', IbCourseSchema)