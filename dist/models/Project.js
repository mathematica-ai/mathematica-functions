import mongoose from 'mongoose';
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true }
});
const Project = mongoose.model('Project', projectSchema);
export default Project;
