import { Container } from 'inversify';
import 'reflect-metadata';
import { TYPES } from './types';
import { VerificationService, IVerificationService } from './services/Verification.service';
import { VerificationController, IVerificationController } from './controllers/Verification.controller';

const container = new Container();

container.bind<IVerificationService>(TYPES.VerificationService).to(VerificationService);
container.bind<IVerificationController>(TYPES.VerificationController).to(VerificationController);

export { container };
