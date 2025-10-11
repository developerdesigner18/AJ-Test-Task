import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { IIssuanceService } from "../services/Issuance.service";
import { AppResponse, StatusMessageEnum } from "../extensions/Response";

export interface IIssuanceController {
    issueCredential(req: Request, res: Response): Promise<void>;
    healthCheck(req: Request, res: Response): Promise<void>;
}

@injectable()
export class IssuanceController implements IIssuanceController {
    constructor(
        @inject(TYPES.IssuanceService) private issuanceService: IIssuanceService
    ) {}

    async issueCredential(req: Request, res: Response): Promise<void> {
        try {
            const credentialData = req.body;
            const result = await this.issuanceService.issueCredential(
                credentialData
            );

            if (result.status == StatusMessageEnum.Success) {
                res.status(201).json(result);
            } else {
                res.status(409).json(result);
            }
        } catch (error: any) {
            res.status(400).json(AppResponse.error("Error issuing credential"));
        }
    }

    async healthCheck(req: Request, res: Response): Promise<void> {
        res.status(200).json(
            AppResponse.success({
                service: "issuance-service",
                timestamp: new Date().toISOString(),
            })
        );
    }
}
