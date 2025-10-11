import { injectable } from "inversify";
import Credential from "../models/Credential.model";
import { AppResponse } from "../extensions/Response";

export interface IVerificationService {
    verifyCredential(credentialData: any): Promise<any>;
}

@injectable()
export class VerificationService implements IVerificationService {
    async verifyCredential(id: string): Promise<any> {
        if (!id) {
            throw new Error("Credential Id is required");
        }

        // Find credential
        const credential = await Credential.findOne({
            credentialId: id,
        });

        if (!credential) {
            console.log(credential);
            return AppResponse.error("Credential not found");
        }

        return AppResponse.success(credential);
    }
}
