import mongoose from 'mongoose';
const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true }
});
const Client = mongoose.model('Client', clientSchema);
export default Client;
