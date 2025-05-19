import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";
describe("Sensors e2e", () => {
  
  const sensorPayload = {
    macAddress: 'AA:BB:CC:DD:EE:01',
    name: 'Temperature Sensor',
    description: 'Measures ambient temperature',
    variable: 'temperature',
    unit: 'C'
  };

    let adminToken: string;
    let operatorToken: string;
    let viewerToken: string;

    const networkCode = "test-net";
    const gatewayMac = "AA:BB:CC:DD:EE:FF";


    beforeAll(async () => {
      await beforeAllE2e();
      adminToken = generateToken(TEST_USERS.admin);
      operatorToken = generateToken(TEST_USERS.operator);
      viewerToken = generateToken(TEST_USERS.viewer);

    });
  
    afterAll(async () => {
      await afterAllE2e();
    });
  
    describe("GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors", () => {
      it("should return empty array when no sensors exist", async () => {
        const res = await request(app)
          .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
          .set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(0);
      });
    });
  
    describe("POST /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors", () => {
  
      it("should allow admin to create a sensor", async () => {
        const res = await request(app)
          .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send(sensorPayload);
        expect(res.status).toBe(201);
      });
  
      it("should forbid viewer from creating a sensor", async () => {
        const res = await request(app)
          .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
          .set("Authorization", `Bearer ${viewerToken}`)
          .send(sensorPayload);
        expect(res.status).toBe(403);
      });
    });
  
    describe("GET /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac", () => {
      it("should retrieve the created sensor", async () => {
        const res = await request(app)
          .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorPayload.macAddress}`)
          .set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(res.body.macAddress).toBe(sensorPayload.macAddress);
        expect(res.body.name).toBe(sensorPayload.name);
        expect(res.body.description).toBe(sensorPayload.description);
        expect(res.body.variable).toBe(sensorPayload.variable);
        expect(res.body.unit).toBe(sensorPayload.unit);
      });
    });
  
    describe("PATCH /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac", () => {
      it("should allow operator to update a sensor", async () => {
        const updatePayload = { name: 'Updated Sensor Name' };
        const res = await request(app)
          .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorPayload.macAddress}`)
          .set("Authorization", `Bearer ${operatorToken}`)
          .send(updatePayload);
        expect(res.status).toBe(204);
  
        const getRes = await request(app)
          .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorPayload.macAddress}`)
          .set("Authorization", `Bearer ${adminToken}`);
        expect(getRes.body.name).toBe(updatePayload.name);
      });
  
      it("should forbid viewer from updating a sensor", async () => {
        const res = await request(app)
          .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorPayload.macAddress}`)
          .set("Authorization", `Bearer ${viewerToken}`)
          .send({ name: 'Should Not Update' });
        expect(res.status).toBe(403);
      });
    });
  
    describe("DELETE /api/v1/networks/:networkCode/gateways/:gatewayMac/sensors/:sensorMac", () => {
      it("should allow admin to delete a sensor", async () => {
        const res = await request(app)
          .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorPayload.macAddress}`)
          .set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(204);
      });
  
      it("should respond with 404 for deleted sensor", async () => {
        const res = await request(app)
          .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorPayload.macAddress}`)
          .set("Authorization", `Bearer ${adminToken}`);
        expect(res.status).toBe(404);
      });
    });
  });

function findByNetwork(networkCode: any) {
  throw new Error("Function not implemented.");
}
