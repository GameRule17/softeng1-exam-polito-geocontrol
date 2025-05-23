// test/e2e/sensors.e2e.test.ts
import request             from 'supertest';
import { app }             from '@app';
import { generateToken }   from '@services/authService';
import {
  beforeAllE2e,
  afterAllE2e,
  TEST_USERS
} from '@test/e2e/lifecycle';

describe('Sensors e2e', () => {
  /* --------------------------------------------------------------- fixture */
  const NET = 'test-net';                     // creato in beforeAllNetworks
  const GW  = 'AA:BB:CC:DD:EE:FF';            // creato in beforeAllGateways
  const SM1 = 'AA:BB:CC:DD:EE:01';            // per create/duplicate
  const SM2 = 'AA:BB:CC:DD:EE:02';            // per update mac

  const sensor1 = {
    macAddress: SM1,
    name:        'Temp Sensor',
    description: 'Measures ambient temperature',
    variable:    'temperature',
    unit:        'C'
  };

  const sensor2 = { ...sensor1, macAddress: SM2 };

  /*  auth tokens */
  let admin: string;
  let operator: string;
  let viewer: string;

  beforeAll(async () => {
    await beforeAllE2e();
    admin    = generateToken(TEST_USERS.admin);
    operator = generateToken(TEST_USERS.operator);
    viewer   = generateToken(TEST_USERS.viewer);
  });

  afterAll(afterAllE2e);

  /*  utils */
  const api = () => `/api/v1/networks/${NET}/gateways/${GW}/sensors`;
  const auth = (tk: string | undefined) =>
    tk ? { Authorization: `Bearer ${tk}` } : {};

  /*  1. LIST EMPTY */
  it('GET list → 200 empty array (fresh DB)', async () => {
    const res = await request(app).get(api()).set(auth(admin));
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  /* 2. CREATE */
  it('POST → 201 (Admin)', async () => {
    const res = await request(app).post(api()).set(auth(admin)).send(sensor1);
    expect(res.status).toBe(201);
  });

  it('POST dup → 409 (mac duplicato)', async () => {
    const res = await request(app).post(api()).set(auth(admin)).send(sensor1);
    expect(res.status).toBe(409);
  });

  it('POST → 403 (Viewer)', async () => {
    const res = await request(app).post(api()).set(auth(viewer)).send(sensor2);
    expect(res.status).toBe(403);
  });

  it('POST → 400 (body mancante/errato)', async () => {
    const res = await request(app).post(api()).set(auth(admin)).send({ name: 'oops' });
    expect(res.status).toBe(400);
  });

  /*  3. READ/LIST */
  it('GET list → 200 contiene sensor1', async () => {
    const res = await request(app).get(api()).set(auth(viewer));
    expect(res.status).toBe(200);
    expect(res.body.map((s: any) => s.macAddress)).toContain(SM1);
  });

  it('GET item → 200 dati corretti', async () => {
    const res = await request(app).get(`${api()}/${SM1}`).set(auth(operator));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(sensor1);
  });

  it('GET item → 404 se mac sconosciuto', async () => {
    const res = await request(app).get(`${api()}/AA:AA:AA:AA:AA:AA`).set(auth(admin));
    expect(res.status).toBe(404);
  });

  /*  4. UPDATE */
  it('PATCH → 204 cambio name (Operator)', async () => {
    const patch = { name: 'Updated Name' };
    const res = await request(app)
      .patch(`${api()}/${SM1}`)
      .set(auth(operator))
      .send(patch);
    expect(res.status).toBe(204);

    const get = await request(app).get(`${api()}/${SM1}`).set(auth(admin));
    expect(get.body.name).toBe(patch.name);
  });

  it('PATCH → 204 cambio mac (Admin)', async () => {
    const patch = { macAddress: SM2 };
    const res = await request(app).patch(`${api()}/${SM1}`).set(auth(admin)).send(patch);
    expect(res.status).toBe(204);

    // vecchio mac non più esistente
    const old = await request(app).get(`${api()}/${SM1}`).set(auth(admin));
    expect(old.status).toBe(404);

    // nuovo mac presente
    const neu = await request(app).get(`${api()}/${SM2}`).set(auth(admin));
    expect(neu.status).toBe(200);
    expect(neu.body.macAddress).toBe(SM2);
  });

  it('PATCH → 403 (Viewer)', async () => {
    const res = await request(app).patch(`${api()}/${SM2}`).set(auth(viewer)).send({ name: 'x' });
    expect(res.status).toBe(403);
  });

  /* 5. DELETE */
  it('DELETE → 204 (Admin)', async () => {
    const res = await request(app).delete(`${api()}/${SM2}`).set(auth(admin));
    expect(res.status).toBe(204);
  });

  it('GET dopo delete → 404', async () => {
    const res = await request(app).get(`${api()}/${SM2}`).set(auth(admin));
    expect(res.status).toBe(404);
  });

  it('DELETE → 401 (token mancante)', async () => {
    const res = await request(app).delete(`${api()}/${SM2}`);
    expect(res.status).toBe(401);
  });

});
