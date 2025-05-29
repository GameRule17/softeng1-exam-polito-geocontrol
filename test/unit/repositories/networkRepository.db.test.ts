import { NetworkRepository } from "@repositories/NetworkRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource
} from "@test/setup/test-datasource";
import { NetworkDAO } from "@dao/NetworkDAO";
import { ConflictError } from "@errors/ConflictError";
import { NotFoundError } from "@errors/NotFoundError";

beforeAll(initializeTestDataSource);
afterAll(closeTestDataSource);

beforeEach(async () => {
  await TestDataSource.getRepository(NetworkDAO).clear();
});

describe("NetworkRepository – SQLite in-memory", () => {
  const repo = new NetworkRepository();

  it("create & get network", async () => {
    await repo.createNetwork("net1", "Name", "Desc");
    const net = await repo.getNetworkByCode("net1");
    expect(net.code).toBe("net1");
    expect(net.name).toBe("Name");
  });

  it("create network: conflict", async () => {
    await repo.createNetwork("net1", "Name", "Desc");
    await expect(
      repo.createNetwork("net1", "Other", "Other")
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("get network: not found", async () => {
    await expect(repo.getNetworkByCode("ghost")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("update network rename + fields", async () => {
    await repo.createNetwork("net1", "Name", "Desc");
    const updated = await repo.updateNetwork("net1", "net2", "New", "NewDesc");
    expect(updated.code).toBe("net2");
    expect(updated.name).toBe("New");
  });

  it("update network: conflict on newCode", async () => {
    await repo.createNetwork("net1", "A", "A");
    await repo.createNetwork("net2", "B", "B");
    await expect(
      repo.updateNetwork("net1", "net2", "C", "C")
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("delete network ok & 404 dopo delete", async () => {
    await repo.createNetwork("net1", "N", "D");
    await expect(repo.deleteNetwork("net1")).resolves.toBeUndefined();
    await expect(repo.deleteNetwork("net1")).rejects.toBeInstanceOf(NotFoundError);
  });
});
