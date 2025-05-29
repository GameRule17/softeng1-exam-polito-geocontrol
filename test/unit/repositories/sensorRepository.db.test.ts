import { SensorRepository } from "@repositories/SensorRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource
} from "@test/setup/test-datasource";
import { NetworkDAO }  from "@dao/NetworkDAO";
import { GatewayDAO }  from "@dao/GatewayDAO";
import { SensorDAO }   from "@dao/SensorDAO";
import { ConflictError } from "@errors/ConflictError";
import { NotFoundError } from "@errors/NotFoundError";
import { Not } from "typeorm";
import { createSensor } from "@controllers/sensorController";

beforeAll(initializeTestDataSource);
afterAll(closeTestDataSource);

beforeEach(async () => {
  await TestDataSource.getRepository(SensorDAO).clear();
  await TestDataSource.getRepository(GatewayDAO).clear();
  await TestDataSource.getRepository(NetworkDAO).clear();
});

const makeNetwork = async (code = "net") => {
  return TestDataSource.getRepository(NetworkDAO).save({ code, name: code, description: code });
};

const makeGateway = async (netCode , mac ) => {
  const net = await makeNetwork(netCode);
  return TestDataSource.getRepository(GatewayDAO).save({
    macAddress: mac,
    name: mac,
    description: mac,
    network: net
  });
};

const makeSensor = async (netCode , gwMac , mac , name , desc , variable , unit ) => {
  const gw = await makeGateway(netCode, gwMac);
  return TestDataSource.getRepository(SensorDAO).save({
    macAddress: mac,
    name: name,
    description: desc,
    variable: variable,
    unit: unit,
    gateway: gw
  });
}

describe("SensorRepository – SQLite in-memory", () => {
  const repo = new SensorRepository();

  it("createSensor + getSensorByMac", async () => {
    const gw = await makeGateway("net1", "GW1");
    const sensort = await makeSensor("net1", gw.macAddress, "S1", "Sensor 1", "Desc 1", "temperature", "C");
    await expect(createSensor("net1", gw.macAddress,sensort)).rejects.toBeInstanceOf(ConflictError);

    // expect(s.macAddress).toBe("S1");

    // const found = await repo.getSensorByMac("net", gw.macAddress, "S1");
    // expect(found.id).toBe(s.id);
  });

  it("createSensor → ConflictError duplicato", async () => {
    const gw = await makeGateway("net", "GW1");
    await repo.createSensor("net", gw.macAddress, "S1");
    await expect(
      repo.createSensor("net", gw.macAddress, "S1")
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("updateSensor cambio name", async () => {
    const gw = await makeGateway("net", "GW1");
    await repo.createSensor("net", gw.macAddress, "S1", "old");
    const upd = await repo.updateSensor("net", gw.macAddress, "S1", { name: "new" });
    expect(upd.name).toBe("new");
  });

  it("updateSensor → ConflictError nuovo mac duplicato", async () => {
    const gw = await makeGateway("net", "GW1");
    await repo.createSensor("net", gw.macAddress, "S1");
    await repo.createSensor("net", gw.macAddress, "S2");
    await expect(
      repo.updateSensor("net", gw.macAddress, "S1", { macAddress: "S2" })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("updateSensor → ConflictError se nuovo MAC è già usato da un gateway", async () => {
    /* 1. gateway che useremo come duplicato */
    await makeGateway("net", "DUP-GW");
  
    /* 2. gateway + sensore da aggiornare */
    await makeGateway("net", "GW1");
    await repo.createSensor("net", "GW1", "S1");
  
    /* 3. update: provo a cambiare MAC del sensore in 'DUP-GW' */
    await expect(
      repo.updateSensor("net", "GW1", "S1", { macAddress: "DUP-GW" })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("deleteSensor ok & 404 dopo", async () => {
    const gw = await makeGateway("net", "GW1");
    await repo.createSensor("net", gw.macAddress, "S1");
    await repo.deleteSensor("net", gw.macAddress, "S1");
    await expect(
      repo.getSensorByMac("net", gw.macAddress, "S1")
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("non può creare sensore se MAC = MAC di un gateway", async () => {
    await makeGateway("net","DUP");
    await makeGateway("net","DUP-GW");
    await expect(
      repo.createSensor("net", "DUP-GW", "DUP")
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("non può creare sensore se MAC già usato da altro sensore", async () => {
    const gw = await makeGateway("net","GW1");
    await repo.createSensor("net", gw.macAddress, "DUP");

    const gw2 = await makeGateway("net","GW2");
    await expect(
      repo.createSensor("net", gw2.macAddress, "DUP")
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
