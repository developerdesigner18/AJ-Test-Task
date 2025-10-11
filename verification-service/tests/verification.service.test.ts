import { jest, describe, it, beforeEach, afterEach, expect } from "@jest/globals";
import { VerificationService } from "../src/services/Verification.service";
import Credential from "../src/models/Credential.model";
import { AppResponse, StatusMessageEnum } from "../src/extensions/Response";

// Mock the Credential model
jest.mock("../src/models/Credential.model");

describe("VerificationService", () => {
    let service: VerificationService;
    let mockCredentialModel: jest.Mocked<typeof Credential>;

    beforeEach(() => {
        service = new VerificationService();
        mockCredentialModel = Credential as jest.Mocked<typeof Credential>;
        
        // Reset all mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("verifyCredential", () => {
        const validCredentialId = "CRED-001";
        const mockCredentialData = {
            credentialId: "CRED-001",
            holderName: "John Doe",
            holderEmail: "john@example.com",
            credentialType: "Certificate",
            _id: "some-id",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it("should return success when credential is found", async () => {
            // Mock findOne to return a credential
            mockCredentialModel.findOne.mockResolvedValue(mockCredentialData as any);

            const result = await service.verifyCredential(validCredentialId);

            expect(mockCredentialModel.findOne).toHaveBeenCalledWith({
                credentialId: validCredentialId,
            });
            expect(mockCredentialModel.findOne).toHaveBeenCalledTimes(1);
            expect(result.status).toBe(StatusMessageEnum.Success);
            expect(result.data).toEqual(mockCredentialData);
        });

        it("should return error when credential is not found", async () => {
            // Mock findOne to return null
            mockCredentialModel.findOne.mockResolvedValue(null);

            const result = await service.verifyCredential(validCredentialId);

            expect(mockCredentialModel.findOne).toHaveBeenCalledWith({
                credentialId: validCredentialId,
            });
            expect(result.status).toBe(StatusMessageEnum.Error);
            expect(result.message).toBe("Credential not found");
        });

        it("should throw error when credential id is empty", async () => {
            await expect(service.verifyCredential("")).rejects.toThrow("Credential Id is required");
            
            // Verify mongoose was not called
            expect(mockCredentialModel.findOne).not.toHaveBeenCalled();
        });

        it("should throw error when credential id is null", async () => {
            await expect(service.verifyCredential(null as any)).rejects.toThrow("Credential Id is required");
            
            expect(mockCredentialModel.findOne).not.toHaveBeenCalled();
        });

        it("should throw error when credential id is undefined", async () => {
            await expect(service.verifyCredential(undefined as any)).rejects.toThrow("Credential Id is required");
            
            expect(mockCredentialModel.findOne).not.toHaveBeenCalled();
        });

        it("should handle database errors during findOne", async () => {
            mockCredentialModel.findOne.mockRejectedValue(new Error("Database connection error"));

            await expect(service.verifyCredential(validCredentialId)).rejects.toThrow("Database connection error");
            
            expect(mockCredentialModel.findOne).toHaveBeenCalledWith({
                credentialId: validCredentialId,
            });
        });

        it("should handle mongoose validation errors", async () => {
            const validationError = new Error("Validation failed");
            validationError.name = "ValidationError";
            mockCredentialModel.findOne.mockRejectedValue(validationError);

            await expect(service.verifyCredential(validCredentialId)).rejects.toThrow("Validation failed");
        });

        it("should handle cast errors from mongoose", async () => {
            const castError = new Error("Cast to ObjectId failed");
            castError.name = "CastError";
            mockCredentialModel.findOne.mockRejectedValue(castError);

            await expect(service.verifyCredential(validCredentialId)).rejects.toThrow("Cast to ObjectId failed");
        });
    });

    describe("edge cases", () => {
        it("should handle credential with special characters in id", async () => {
            const specialId = "CRED-001@#$%";
            const mockCredential = {
                credentialId: specialId,
                holderName: "Test User",
                holderEmail: "test@example.com",
                credentialType: "Certificate",
            };

            mockCredentialModel.findOne.mockResolvedValue(mockCredential as any);

            const result = await service.verifyCredential(specialId);

            expect(mockCredentialModel.findOne).toHaveBeenCalledWith({
                credentialId: specialId,
            });
            expect(result.status).toBe(StatusMessageEnum.Success);
            expect(result.data.credentialId).toBe(specialId);
        });

        it("should handle very long credential ids", async () => {
            const longId = "CRED-" + "A".repeat(1000);
            mockCredentialModel.findOne.mockResolvedValue(null);

            const result = await service.verifyCredential(longId);

            expect(mockCredentialModel.findOne).toHaveBeenCalledWith({
                credentialId: longId,
            });
            expect(result.status).toBe(StatusMessageEnum.Error);
            expect(result.message).toBe("Credential not found");
        });

        it("should handle case sensitivity in credential ids", async () => {
            const caseSensitiveId = "cred-001"; // lowercase
            mockCredentialModel.findOne.mockResolvedValue(null);

            const result = await service.verifyCredential(caseSensitiveId);

            expect(mockCredentialModel.findOne).toHaveBeenCalledWith({
                credentialId: caseSensitiveId, // Should match exactly as provided
            });
            expect(result.status).toBe(StatusMessageEnum.Error);
        });
    });
});