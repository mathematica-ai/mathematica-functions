import mongoose from 'mongoose';

const organisationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true }
});

const Organisation = mongoose.model('Organisation', organisationSchema);

export default Organisation; 