import {
    jest,
    describe,
    it,
    beforeEach,
    afterEach,
    expect,
} from "@jest/globals";
import { IssuanceService } from "../src/services/Issuance.service";
import Credential from "../src/models/Credential.model";
import { StatusMessageEnum } from "../src/extensions/Response";
import os from "os";

// Mock the Credential model
jest.mock("../src/models/Credential.model");

describe("IssuanceService", () => {
    let service: IssuanceService;
    let mockCredentialModel: jest.Mocked<typeof Credential>;

    beforeEach(() => {
        service = new IssuanceService();
        mockCredentialModel = Credential as jest.Mocked<typeof Credential>;

        // Reset all mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("issueCredential", () => {
        const validCredentialData = {
            credentialId: "CRED-001",
            holderName: "John Doe",
            holderEmail: "john@example.com",
            credentialType: "Certificate",
        };

        it("should return error when required fields are missing", async () => {
            const incompleteData = {
                credentialId: "CRED-001",
                holderName: "John Doe",
                // missing holderEmail and credentialType
            };

            const result = await service.issueCredential(incompleteData);

            expect(result.status).toBe(StatusMessageEnum.Error);
            expect(result.message).toBe("missinng required fields");
        });

        it("should return already_issued when credential already exists", async () => {
            // Mock findOne to return an existing credential
            const mockExistingCredential = { credentialId: "CRED-001" };
            mockCredentialModel.findOne.mockResolvedValue(
                mockExistingCredential as any
            );

            const result = await service.issueCredential(validCredentialData);

            expect(mockCredentialModel.findOne).toHaveBeenCalledWith({
                credentialId: "CRED-001",
            });
            expect(result.status).toBe(StatusMessageEnum.AlreadyIssued);
            expect(result.data).toEqual(validCredentialData);
        });

        it("should create new credential when it does not exist", async () => {
            // Mock findOne to return null (credential doesn't exist)
            mockCredentialModel.findOne.mockResolvedValue(null);

            // Mock the save method

            // @ts-expect-error
            const mockSave = jest.fn().mockResolvedValue(validCredentialData);
            const mockCredentialInstance = {
                save: mockSave,
            };
            mockCredentialModel.mockReturnValue(mockCredentialInstance as any);

            // Mock getWorkerName
            jest.spyOn(service as any, "getWorkerName").mockReturnValue(
                "worker-1"
            );

            const result = await service.issueCredential(validCredentialData);

            expect(mockCredentialModel.findOne).toHaveBeenCalledWith({
                credentialId: "CRED-001",
            });

            // Verify new Credential was created with correct data
            expect(mockCredentialModel).toHaveBeenCalledWith({
                credentialId: "CRED-001",
                holderName: "John Doe",
                holderEmail: "john@example.com",
                credentialType: "Certificate",
                workerId: "worker-1",
            });

            expect(mockSave).toHaveBeenCalledTimes(1);
            expect(result.status).toBe(StatusMessageEnum.Success);
            expect(result.data).toEqual(validCredentialData);
        });

    });

    describe("getWorkerName", () => {
        it("should return HOSTNAME environment variable when available", () => {
            const originalEnv = process.env.HOSTNAME;
            process.env.HOSTNAME = "k8s-pod-123";

            const workerName = (service as any).getWorkerName();

            expect(workerName).toBe("k8s-pod-123");
            process.env.HOSTNAME = originalEnv;
        });

        it("should return os hostname when HOSTNAME is not available", () => {
            const originalEnv = process.env.HOSTNAME;
            delete process.env.HOSTNAME;

            const mockHostname = "local-machine";
            jest.spyOn(os, "hostname").mockReturnValue(mockHostname);

            const workerName = (service as any).getWorkerName();

            expect(workerName).toBe(mockHostname);
            process.env.HOSTNAME = originalEnv;
        });

        it("should return fallback when neither HOSTNAME nor os.hostname is available", () => {
            const originalEnv = process.env.HOSTNAME;
            delete process.env.HOSTNAME;

            jest.spyOn(os, "hostname").mockReturnValue("");

            const workerName = (service as any).getWorkerName();

            expect(workerName).toBe("worker-unknown");
            process.env.HOSTNAME = originalEnv;
        });
    });

    describe("edge cases", () => {
        it("should handle empty string values in required fields", async () => {
            const emptyFieldData = {
                credentialId: "",
                holderName: "John Doe",
                holderEmail: "john@example.com",
                credentialType: "Certificate",
            };

            const result = await service.issueCredential(emptyFieldData);

            expect(result.status).toBe(StatusMessageEnum.Error);
            expect(result.message).toBe("missinng required fields");
        });

        it("should handle null values in required fields", async () => {
            const nullFieldData = {
                credentialId: "CRED-001",
                holderName: null,
                holderEmail: "john@example.com",
                credentialType: "Certificate",
            };

            const result = await service.issueCredential(nullFieldData as any);

            expect(result.status).toBe(StatusMessageEnum.Error);
            expect(result.message).toBe("missinng required fields");
        });

        it("should handle undefined values in required fields", async () => {
            const undefinedFieldData = {
                credentialId: "CRED-001",
                holderName: "John Doe",
                holderEmail: undefined,
                credentialType: "Certificate",
            };

            const result = await service.issueCredential(
                undefinedFieldData as any
            );

            expect(result.status).toBe(StatusMessageEnum.Error);
            expect(result.message).toBe("missinng required fields");
        });
    });
});
