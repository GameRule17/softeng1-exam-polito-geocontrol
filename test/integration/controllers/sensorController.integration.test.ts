// test/unit/sensorController.integration.test.ts
import * as sensorController from '@controllers/sensorController';
import { SensorRepository }    from '@repositories/SensorRepository';
import { SensorDAO }           from '@dao/SensorDAO';
import { GatewayDAO }          from '@dao/GatewayDAO';
import { NetworkDAO }          from '@dao/NetworkDAO';

jest.mock('@repositories/SensorRepository');

describe('SensorController integration', () => {
  const fakeNetwork: NetworkDAO = { id:1, code:'net1', name:'N1', description:'d', gateways:[] };
  const fakeGateway: GatewayDAO = { id:1, macAddress:'gw1', name:'G1', description:'d', network:fakeNetwork, sensors:[] };
  const fakeSensor: SensorDAO = {
    id:1,
    macAddress:'s1',
    name:'S1',
    description:'d',
    variable:'temperature',
    unit:'C',
    gateway:fakeGateway
  };

  const expectedDTO = {
    macAddress: fakeSensor.macAddress,
    name:        fakeSensor.name,
    description: fakeSensor.description,
    variable:    fakeSensor.variable,
    unit:        fakeSensor.unit
  };

  beforeEach(() => jest.clearAllMocks());

  it('getSensorsByGateway → mappa correttamente DAO[]→DTO[]', async () => {
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      findByGateway: jest.fn().mockResolvedValue([fakeSensor])
    }));
    const result = await sensorController.getSensorsByGateway('net1','gw1');
    expect(result).toEqual([expectedDTO]);
  });

  it('getSensor → mappa correttamente DAO→DTO', async () => {
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      getSensorByMac: jest.fn().mockResolvedValue(fakeSensor)
    }));
    const result = await sensorController.getSensor('net1','gw1','s1');
    expect(result).toEqual(expectedDTO);
  });

  it('createSensor → restituisce DTO senza id/gateway', async () => {
    const spy = jest.fn().mockResolvedValue(undefined);
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      createSensor: spy
    }));
    await expect(
      sensorController.createSensor('net1','gw1', expectedDTO)
    ).resolves.toBeUndefined();

    expect(spy).toHaveBeenCalledWith(
      'net1',
      'gw1',
      expectedDTO.macAddress,
      expectedDTO.name,
      expectedDTO.description,
      expectedDTO.variable,
      expectedDTO.unit
    );

  });

  it('updateSensor → non lancia errori', async () => {
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      updateSensor: jest.fn().mockResolvedValue(fakeSensor)
    }));
    const result = sensorController.updateSensor('net1','gw1','s1',{name:'NewName'});
      
    expect(result).resolves.toEqual(expectedDTO);

  });

  it('deleteSensor → non lancia errori', async () => {
    const spy = jest.fn().mockResolvedValue(undefined);
    (SensorRepository as jest.Mock).mockImplementation(() => ({
      deleteSensor: spy
    }));
    await expect(sensorController.deleteSensor('net1','gw1','s1'))
      .resolves.not.toThrow();

      expect(spy).toHaveBeenCalledWith('net1','gw1','s1');
  });
});
