// test/integration/controllers/sensorRoutes.integration.test.ts
import request from 'supertest';
import { app } from '@app';
import * as authService from '@services/authService';
import * as sensorController from '@controllers/sensorController';
import { UserType } from '@models/UserType';
import { UnauthorizedError } from '@errors/UnauthorizedError';
import { InsufficientRightsError } from '@errors/InsufficientRightsError';

jest.mock('@services/authService');
jest.mock('@controllers/sensorController');

describe('SensorRoutes integration', () => {
  const token = 'Bearer faketoken';
  const nc    = 'networkCode';
  const gw    = 'AA:BB:CC:DD:EE:01';
  const sm    = 'AA:BB:CC:DD:EE:02';

  const listSensors = [
    { macAddress: sm, name: 'Sensor1', description: 'desc', variable: 'temperature', unit: 'C' }
  ];
  const singleSensor = listSensors[0];
  const createDto = {
    macAddress: 'AA:BB:CC:DD:EE:03',
    name:        'New Sensor',
    description: 'desc',
    variable:    'humidity',
    unit:        '%'
  };
  const updateDto = { name: 'Updated Sensor' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET  /networks/:nc/gateways/:gw/sensors → 200 + array', async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensorsByGateway as jest.Mock).mockResolvedValue(listSensors);

    const res = await request(app)
      .get(`/api/v1/networks/${nc}/gateways/${gw}/sensors`)
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(listSensors);
    expect(authService.processToken).toHaveBeenCalledWith(
      token,
      [UserType.Admin, UserType.Operator, UserType.Viewer]
    );
    expect(sensorController.getSensorsByGateway).toHaveBeenCalledWith(nc, gw);
  });

  it('POST /networks/:nc/gateways/:gw/sensors → 201', async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.createSensor as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .post(`/api/v1/networks/${nc}/gateways/${gw}/sensors`)
      .set('Authorization', token)
      .send(createDto);

    expect(res.status).toBe(201);
    expect(sensorController.createSensor).toHaveBeenCalledWith(nc, gw, createDto);
  });

  it('GET  /networks/:nc/gateways/:gw/sensors/:sm → 200 + object', async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.getSensor as jest.Mock).mockResolvedValue(singleSensor);

    const res = await request(app)
      .get(`/api/v1/networks/${nc}/gateways/${gw}/sensors/${sm}`)
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(singleSensor);
    expect(sensorController.getSensor).toHaveBeenCalledWith(nc, gw, sm);
  });

  it('PATCH /networks/:nc/gateways/:gw/sensors/:sm → 204', async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.updateSensor as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .patch(`/api/v1/networks/${nc}/gateways/${gw}/sensors/${sm}`)
      .set('Authorization', token)
      .send(updateDto);

    expect(res.status).toBe(204);
    expect(sensorController.updateSensor).toHaveBeenCalledWith(nc, gw, sm, updateDto);
  });

  it('DELETE /networks/:nc/gateways/:gw/sensors/:sm → 204', async () => {
    (authService.processToken as jest.Mock).mockResolvedValue(undefined);
    (sensorController.deleteSensor as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app)
      .delete(`/api/v1/networks/${nc}/gateways/${gw}/sensors/${sm}`)
      .set('Authorization', token);

    expect(res.status).toBe(204);
    expect(sensorController.deleteSensor).toHaveBeenCalledWith(nc, gw, sm);
  });

  it('GET list → 401 se UnauthorizedError', async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
      throw new UnauthorizedError('No token');
    });

    const res = await request(app)
      .get(`/api/v1/networks/${nc}/gateways/${gw}/sensors`)
      .set('Authorization', token);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/No token/);
  });

  it('GET list → 403 se InsufficientRightsError', async () => {
    (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError('Insufficient rights');
    });

    const res = await request(app)
      .patch(`/api/v1/networks/${nc}/gateways/${gw}/sensors/${sm}`)
      .set('Authorization', token).send(updateDto);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Insufficient rights/);
  });
});
