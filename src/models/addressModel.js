import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    buildingName: {type: String, required: true},
    street: { type: String, required: true},
    city: { type: String, required: true},
    state: { type: String, required: true},
    country: { type: String, required: true},
    zipCode: { type: String, required: true},
    landmark: { type: String },
    isDefault: { type: Boolean, default: true},
    isDeleted: { type: Boolean, default: false}
},{
    timestamps: true
});

// TODO: When allowing multiple address make sure to add pre function

const Address = mongoose.model('Address', addressSchema);
export default Address;