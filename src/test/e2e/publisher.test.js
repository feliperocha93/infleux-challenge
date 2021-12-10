const request = require('supertest');
const mongoose = require('mongoose');
const Publisher = require('../../app/models/publisher');

const server = require('../../index');

const MAIN_ROUTE = '/publishers';

const testData = {
  name: 'Publisher Name',
  country_id: '61afdbb887143b4029d7a6b3',
};

function cleanDb() {
  Publisher.deleteMany({}, {}, () => null);
}

afterAll(() => {
  server.close();
});

describe('when to store a advertiser', () => {
  beforeAll(() => {
    cleanDb();
  });

  test('should create a publishers', async () => {
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send(testData);

    expect(status).toBe(201);
    expect(body.name).toBe('Publisher Name');
    expect(body).toHaveProperty('_id');
    expect(body).toHaveProperty('country_id');
    expect(body).toHaveProperty('campaigns_id');

    const documentCreated = Publisher.find({ name: testData.name });

    expect(documentCreated).toBeTruthy();
  });

  test.each(
    [false, null, undefined, 0, NaN, ''],
  )('should not create a advertisers without name', async (name) => {
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        ...testData,
        name,
      });

    expect(status).toBe(400);
    expect(body.error).toBe('name is required');
  });

  test.each(
    [false, null, undefined, 0, NaN, ''],
  )('should not create a advertisers without country_id', async (country_id) => {
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        ...testData,
        country_id,
      });

    expect(status).toBe(400);
    expect(body.error).toBe('country_id is required');
  });

  test('should not create if country_id is not exist', async () => {
    const id = mongoose.Types.ObjectId();

    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        ...testData,
        country_id: id,
      });

    expect(status).toBe(404);
    expect(body.error).toBe('country_id not found');
  });

  test('should not save campaigns on create publishers', async () => {
    const id = mongoose.Types.ObjectId;
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        ...testData,
        campaigns_id: [id],
      });

    expect(status).toBe(201);
    expect(body.campaigns_id.length).toBe(0);
  });
});
