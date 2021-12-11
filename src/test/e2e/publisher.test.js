const request = require('supertest');
const mongoose = require('mongoose');
const Publisher = require('../../app/models/publisher');

const server = require('../../index');

const MAIN_ROUTE = '/publishers';

const testData = {
  name: 'Publisher Name',
  country_id: '61afdbb887143b4029d7a6b3',
};

const randomId = '61b3ec4225c8549f886d1af8';

function cleanDb() {
  Publisher.deleteMany({}, {}, () => null);
}

afterAll(() => {
  server.close();
});

describe('when to store a publisher', () => {
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
  )('should not create a publishers without name', async (name) => {
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
  )('should not create a publishers without country_id', async (country_id) => {
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

describe('when to find a publisher', () => {
  const localName = 'Find Test';
  let findTestId;

  beforeAll(async () => {
    cleanDb();
    const { _id } = await Publisher.create({ ...testData, name: localName });
    findTestId = _id;
    Publisher.create(testData);
  });

  test('should return all publishers', async () => {
    const { body, status } = await request(server)
      .get(MAIN_ROUTE);

    expect(status).toBe(200);
    expect(body.length).toBe(2);
  });

  test('should return publisher by id', async () => {
    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/${findTestId}`);

    expect(status).toBe(200);
    expect(body.name).toBe(localName);
  });

  test('should return a not found error when filter by inexistent id', async () => {
    const id = mongoose.Types.ObjectId();

    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/${id}`);

    expect(status).toBe(404);
    expect(body.error).toBe('publisher not found');
  });

  test.each([
    [localName, undefined, 1],
    [testData.name, undefined, 1],
    [undefined, testData.country_id, 2],
    [undefined, randomId, 0],
  ])('when filter by %s and %s should return %i publishers by filters', async (name, country_id, lentgh) => {
    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/filter`)
      .query({ name, country_id });

    expect(status).toBe(200);
    expect(body.length).toBe(lentgh);
  });

  // TODO: After campaign controller is done
  test.todo('should return publisher by campaign_id');
});

describe.skip('when to update a publisher', () => {
  const localName = 'Update Test';
  let updateTestId;

  beforeAll(async () => {
    cleanDb();
    const { _id } = await Publisher.create({ ...testData, name: localName });
    updateTestId = _id;
    Publisher.create(testData);
  });

  test.each(
    [false, null, undefined, 0, NaN, ''],
  )('should not update a publisher without name', async (newName) => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${updateTestId}`)
      .send({
        name: newName,
      });

    expect(status).toBe(400);
    expect(body.error).toBe('name is required');

    const documentNotUpdated = await Publisher.findById(updateTestId);

    expect(documentNotUpdated.name).toBe(localName);
  });

  test('should update publisher', async () => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${updateTestId}`)
      .send({
        name: testData.name,
      });

    expect(status).toBe(200);
    expect(body.name).toBe(testData.name);

    const documentUpdated = await Publisher.findById(updateTestId);

    expect(documentUpdated.name).toBe(testData.name);
  });

  // TODO: After campaign controller is done
  test.todo('should update campaigns_ids');
  test.todo('should not update if campaigns_ids are invalid');
});

describe('when to delete a publisher', () => {
  const localName = 'Delete Test';
  let deleteTestId;

  beforeAll(async () => {
    cleanDb();
    const { _id } = await Publisher.create({ ...testData, name: localName });
    deleteTestId = _id;
    Publisher.create(testData);
  });

  test('should delete publisher', async () => {
    const { status } = await request(server)
      .delete(`${MAIN_ROUTE}/${deleteTestId}`);

    expect(status).toBe(204);

    const deletedPublisher = await Publisher.findById(deleteTestId);

    expect(deletedPublisher).toBeNull();
  });

  test('should return a not found error if publisher not exist', async () => {
    const { body, status } = await request(server).delete(`${MAIN_ROUTE}/${randomId}`);

    expect(status).toBe(404);
    expect(body.error).toBe('publisher not found');
  });

  // TODO: After campaign controller is done
  test.todo('should return a error if publisher has campaign_ids is not empty');
});
