import mongoose, { Schema, Document } from "mongoose";

export interface ICredential extends Document {
    credentialId: string;
    holderName: string;
    holderEmail: string;
    credentialType: string;
    workerId?: string;
}

const CredentialSchema: Schema = new Schema(
    {
        credentialId: { type: String, required: true, unique: true },
        holderName: { type: String, required: true },
        holderEmail: { type: String, required: true },
        credentialType: { type: String, required: true },
        workerId: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ICredential>("Credential", CredentialSchema);
