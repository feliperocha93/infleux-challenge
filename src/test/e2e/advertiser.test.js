const request = require('supertest');
const mongoose = require('../../database');
const Advertiser = require('../../app/models/Advertiser');

const server = require('../../index');

const MAIN_ROUTE = '/advertisers';

const testData = {
  name: 'Advertiser Name',
};

function cleanDb() {
  Advertiser.deleteMany({}, {}, () => null);
}

afterAll(() => {
  server.close();
});

describe('when to store a advertiser', () => {
  beforeAll(() => {
    cleanDb();
  });

  test('should create a advertisers', async () => {
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        name: testData.name,
      });

    expect(status).toBe(201);
    expect(body.name).toBe('Advertiser Name');
    expect(body).toHaveProperty('_id');
    expect(body).toHaveProperty('campaigns_id');

    const documentCreated = Advertiser.find({ name: testData.name });

    expect(documentCreated).toBeTruthy();
  });

  test.each(
    [false, null, undefined, 0, NaN, ''],
  )('should not create a advertisers without name', async (name) => {
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        name,
      });

    expect(status).toBe(400);
    expect(body.error).toBe('name is required');
  });

  test('should not save campaigns on create advertiser', async () => {
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        name: testData.name,
        collections_id: [1, 3, 44, 107],
      });

    expect(status).toBe(201);
    expect(body.campaigns_id.length).toBe(0);
  });
});

describe('when to find a advertiser', () => {
  const name = 'Find Test';
  let findTestId;

  beforeAll(async () => {
    cleanDb();
    const { _id } = await Advertiser.create({ name });
    findTestId = _id;
    Advertiser.create({ name: testData.name });
  });

  test('should return all advertiser', async () => {
    const { body, status } = await request(server)
      .get(MAIN_ROUTE);

    expect(status).toBe(200);
    expect(body.length).toBe(2);
  });

  test('should return advertiser by id', async () => {
    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/${findTestId}`);

    expect(status).toBe(200);
    expect(body.name).toBe(name);
  });

  test('should return a not found error when filter by inexistent id', async () => {
    const id = mongoose.Types.ObjectId();

    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/${id}`);

    expect(status).toBe(404);
    expect(body.error).toBe('advertiser not found');
  });

  test.each([
    ['name', name],
    ['name', testData.name],
  ])('should return advertiser by filters', async (filter, value) => {
    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/filter`)
      .query({ [filter]: value });

    expect(status).toBe(200);
    expect(body.length).toBe(1);
  });

  // TODO: After campaign controller is done
  test.todo('should return advertiser by campaign_id');
});

describe('when to update a advertiser', () => {
  const name = 'Update Test';
  let updateTestId;

  beforeAll(async () => {
    cleanDb();
    const { _id } = await Advertiser.create({ name });
    updateTestId = _id;
    Advertiser.create({ name: testData.name });
  });

  test.each(
    [false, null, undefined, 0, NaN, ''],
  )('should not update a advertiser without name', async (newName) => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${updateTestId}`)
      .send({
        name: newName,
      });

    expect(status).toBe(400);
    expect(body.error).toBe('name is required');

    const documentNotUpdated = await Advertiser.findById(updateTestId);

    expect(documentNotUpdated.name).toBe(name);
  });

  test('should update advertiser', async () => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${updateTestId}`)
      .send({
        name: testData.name,
      });

    expect(status).toBe(200);
    expect(body.name).toBe(testData.name);

    const documentUpdated = await Advertiser.findById(updateTestId);

    expect(documentUpdated.name).toBe(testData.name);
  });
});

describe('when to delete a advertiser', () => {
  const name = 'Delete Test';
  let deleteTestId;

  beforeAll(async () => {
    cleanDb();
    const { _id } = await Advertiser.create({ name });
    deleteTestId = _id;
    Advertiser.create({ name: testData.name });
  });

  test('should delete advertiser', async () => {
    const { status } = await request(server)
      .delete(`${MAIN_ROUTE}/${deleteTestId}`);

    expect(status).toBe(204);

    const deletedAdvertiser = await Advertiser.findById(deleteTestId);

    expect(deletedAdvertiser).toBeNull();
  });

  test('should return a not found error if advertiser not exist', async () => {
    const id = mongoose.Types.ObjectId();

    const { body, status } = await request(server).delete(`${MAIN_ROUTE}/${id}`);

    expect(status).toBe(404);
    expect(body.error).toBe('advertiser not found');
  });
});
