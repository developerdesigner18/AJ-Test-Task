import { injectable } from "inversify";
import Credential, { ICredential } from "../models/Credential.model";
import os from "os";
import { AppResponse } from "../extensions/Response";

export interface IIssuanceService {
    issueCredential(credentialData: Partial<ICredential>): Promise<any>;
}

@injectable()
export class IssuanceService implements IIssuanceService {
    private getWorkerName(): string {
        return process.env.HOSTNAME || os.hostname() || "worker-unknown";
    }

    async issueCredential(credentialData: Partial<ICredential>): Promise<any> {
        const { credentialId, holderName, holderEmail, credentialType } =
            credentialData;

        if (!credentialId || !holderName || !holderEmail || !credentialType) {
            return AppResponse.error("missinng required fields");
        }

        // Check if credential already exists
        const existingCredential = await Credential.findOne({ credentialId });

        if (existingCredential) {
            return AppResponse.alreadyIssued(existingCredential);
        }

        // Issue new credential
        const workerName = this.getWorkerName();
        const newCredential = new Credential({
            credentialId,
            holderName,
            holderEmail,
            credentialType,
            workerId: workerName,
        });

        await newCredential.save();

        return AppResponse.success(newCredential);
    }
}
