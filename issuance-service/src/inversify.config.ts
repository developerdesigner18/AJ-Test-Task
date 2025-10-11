import { Container } from 'inversify';
import 'reflect-metadata';
import { TYPES } from './types';
import { IssuanceService, IIssuanceService } from './services/Issuance.service';
import { IssuanceController, IIssuanceController } from './controllers/Issuance.controller';

const container = new Container();

container.bind<IIssuanceService>(TYPES.IssuanceService).to(IssuanceService);
container.bind<IIssuanceController>(TYPES.IssuanceController).to(IssuanceController);

export { container };
