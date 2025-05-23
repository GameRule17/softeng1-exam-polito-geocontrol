import {
  initializeTestDataSource,
  closeTestDataSource
} from "@test/setup/test-datasource";
import { UserRepository } from "@repositories/UserRepository";
import { UserType } from "@models/UserType";
import { NetworkRepository } from "@repositories/NetworkRepository";
import { GatewayRepository } from "@repositories/GatewayRepository";

export const TEST_USERS = {
  admin: { username: "admin", password: "adminpass", type: UserType.Admin },
  operator: {
    username: "operator",
    password: "operatorpass",
    type: UserType.Operator
  },
  viewer: { username: "viewer", password: "viewerpass", type: UserType.Viewer }
};


export async function beforeAllNetworks(){
  const networkRepo = new NetworkRepository();
  await networkRepo.createNetwork("test-net","Test Network","E2E test network" );
  await networkRepo.createNetwork("test-net-2","Test Network 2","E2E test network 2" );
  await networkRepo.createNetwork("test-net-3","Test Network 3","E2E test network 3" );
}

export async function beforeAllGateways(){
  const gatewayRepo = new GatewayRepository();
  await gatewayRepo.createGateway("test-net","AA:BB:CC:DD:EE:FF","Test Gateway","E2E test gateway" );
  await gatewayRepo.createGateway("test-net-2","AA:BB:CC:DD:EE:GG","Test Gateway 2","E2E test gateway 2" );
  await gatewayRepo.createGateway("test-net-3","AA:BB:CC:DD:EE:HH","Test Gateway 3","E2E test gateway 3");
}

export async function beforeAllE2e() {
  await initializeTestDataSource();
  const repo = new UserRepository();
  await repo.createUser(
    TEST_USERS.admin.username,
    TEST_USERS.admin.password,
    TEST_USERS.admin.type
  );
  await repo.createUser(
    TEST_USERS.operator.username,
    TEST_USERS.operator.password,
    TEST_USERS.operator.type
  );
  await repo.createUser(
    TEST_USERS.viewer.username,
    TEST_USERS.viewer.password,
    TEST_USERS.viewer.type
  );
  await beforeAllNetworks();
  await beforeAllGateways();
}
export async function afterAllE2e() {
  await closeTestDataSource();
}
