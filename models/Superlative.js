import mongoose from 'mongoose'

const SuperlativeSchema = new mongoose.Schema({
    text: String,
    open: Boolean
})

export default mongoose.models.Superlative || mongoose.model("Superlative", SuperlativeSchema)