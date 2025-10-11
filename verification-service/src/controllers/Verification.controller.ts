import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import "reflect-metadata";
import { TYPES } from "../types";
import { IVerificationService } from "../services/Verification.service";
import { AppResponse, StatusMessageEnum } from "../extensions/Response";

export interface IVerificationController {
    verifyCredential(req: Request, res: Response): Promise<void>;
    healthCheck(req: Request, res: Response): Promise<void>;
}

@injectable()
export class VerificationController implements IVerificationController {
    constructor(
        @inject(TYPES.VerificationService)
        private verificationService: IVerificationService
    ) {}

    async verifyCredential(req: Request, res: Response): Promise<void> {
        try {
            const credentialData = req.params;
            const result = await this.verificationService.verifyCredential(
                credentialData.id
            );

            if (result.status == StatusMessageEnum.Success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error: any) {
            res.status(400).json(
                AppResponse.error("Error verifying credential")
            );
        }
    }

    async healthCheck(req: Request, res: Response): Promise<void> {
        res.status(200).json(
            AppResponse.success({
                service: "verification-service",
                timestamp: new Date().toISOString(),
            })
        );
    }
}
