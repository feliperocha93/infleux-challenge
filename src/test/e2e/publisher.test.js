const request = require('supertest');
const mongoose = require('../../database');
const Publisher = require('../../app/models/publisher');

const server = require('../../index');

const MAIN_ROUTE = '/publishers';

// TODO: country_id must be taked in DB
const testData = {
  name: 'Publisher Name',
  country_id: '61afdbb887143b4029d7a6b3',
};

// TODO: Try make it automatic
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

  // TODO: Check country_id type
  test.todo('should not create if country_id is invalid');
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

describe('when to update a publisher', () => {
  const localName = 'Update Test';
  let updateTestId;

  beforeAll(async () => {
    cleanDb();
    const { _id } = await Publisher.create({ ...testData, name: localName });
    updateTestId = _id;
    Publisher.create(testData);
  });

  test('should not update if payload is empty', async () => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${updateTestId}`)
      .send({});

    expect(status).toBe(400);
    expect(body.error).toBe('payload can not be empty');
  });

  test.each(
    [false, null, 0, NaN, ''],
  )('should not update if name is invalid', async (newName) => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${updateTestId}`)
      .send({
        name: newName,
      });

    expect(status).toBe(400);
    expect(body.error).toBe('name is invalid');

    const documentNotUpdated = await Publisher.findById(updateTestId);

    expect(documentNotUpdated.name).toBe(localName);
  });

  test.each(
    [false, null, 0, NaN, '', 12365487897, 'Olá mundo', 'sad4as5646sad4as5646'],
  )('should not update if country_id is invalid', async (country_id) => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${updateTestId}`)
      .send({
        country_id,
      });

    expect(status).toBe(400);
    expect(body.error).toBe('country_id is invalid');

    const documentNotUpdated = await Publisher.findById(updateTestId);

    expect(documentNotUpdated.country_id.toString()).toBe(testData.country_id);
  });

  test.todo('should not update if campaigns_ids is invalid');

  test('should return a not found error if publisher not exist', async () => {
    const id = mongoose.Types.ObjectId();

    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${id}`)
      .send({ name: localName });

    expect(status).toBe(404);
    expect(body.error).toBe('publisher not found');
  });

  test('should return a not found error if country_id not exist', async () => {
    const id = mongoose.Types.ObjectId();

    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${updateTestId}`)
      .send({ country_id: id });

    expect(status).toBe(404);
    expect(body.error).toBe('country_id not found');
  });

  // TODO: After campaign controller is done
  test.todo('should return a not found error if campaigns_ids not exist');

  test.skip.each([
    ['name', testData.name],
    ['country_id', '61afdbb887143b4029d7a6b4'],
  ])('should update publisher %s to %s', async (field, value) => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${updateTestId}`)
      .send({
        [field]: value,
      });

    expect(status).toBe(200);
    expect(body[field]).toBe(value);

    const documentUpdated = await Publisher.findById(updateTestId);

    expect(documentUpdated[field]).toBe(value);
  });

  // TODO: After campaign controller is done
  test.todo('should update campaigns_ids');
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
