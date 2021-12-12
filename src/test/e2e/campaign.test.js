const request = require('supertest');
const mongoose = require('../../database');

const Advertiser = require('../../app/models/Advertiser');
const Campaign = require('../../app/models/Campaign');
const Country = require('../../app/models/Country');
const Publisher = require('../../app/models/Publisher');

const server = require('../../index');

const MAIN_ROUTE = '/campaigns';

// TODO: get ids in database
const testData = {
  name: 'Nova Campanha',
  campaign_type: 'CPC',
  bid: '35.00',
  advertiser_id: '61b4bf3bdbded9ee9c8c46db',
  countries_id: [],
};

const advertiserData = {
  name: 'Advertiser Name',
};

// const publisherData = {
//   name: 'Publisher Name',
//   country_id: '61afdbb887143b4029d7a6b3',
// };

const randomId = mongoose.Types.ObjectId();

function cleanDb() {
  Advertiser.deleteMany({}, {}, () => null);
  Campaign.deleteMany({}, {}, () => null);
  Publisher.deleteMany({}, {}, () => null);
}

async function requiredTestTemplate(field, value) {
  const { body, status } = await request(server)
    .post(MAIN_ROUTE)
    .send({ ...testData, [field]: value });

  expect(status).toBe(400);
  expect(body.errors[0]).toBe(`${field} is required`);
}

async function invalidTestTemplate(field, value) {
  const { body, status } = await request(server)
    .post(MAIN_ROUTE)
    .send({ ...testData, [field]: value });

  expect(status).toBe(400);
  expect(body.errors[0]).toBe(`${field} is invalid`);
}

afterAll(() => {
  server.close();
});

describe('when to store a campaign', () => {
  beforeAll(async () => {
    cleanDb();
    const { _id } = await Advertiser.create(advertiserData);
    testData.advertiser_id = _id.toString();

    const country_id = await Country.create({ name: 'China' });
    testData.countries_id.push(country_id);
  });

  test('should create a campaign', async () => {
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send(testData);

    expect(status).toBe(201);
    expect(body.name).toBe(testData.name);
    expect(body).toHaveProperty('_id');
    expect(body).toHaveProperty('advertiser_id');
    expect(body).toHaveProperty('campaign_type');
    expect(body).toHaveProperty('countries_id');
    expect(body).toHaveProperty('bid');
    expect(body).toHaveProperty('publishers');

    const documentCreated = Campaign.find({ name: testData.name });

    expect(documentCreated).toBeTruthy();
  });

  test.each(
    ['name', 'campaign_type', 'bid', 'advertiser_id'],
  )('should not create a campaign without %s', async (field) => {
    await requiredTestTemplate(field, undefined);
  });

  describe.each([
    ['campaign_type', ['CCPC', 215]],
    ['bid', [-500, 0]],
    ['advertiser_id', ['s3a1s65a4s', 12564654]],
    ['countries_id', [['32156465', 1654654654], '55465465456']],
  ])('should not create a campaign with a invalid', (field, values) => {
    test.each(values)('%s', async (value) => {
      await invalidTestTemplate(field, value);
    });
  });

  test('should not save a publisher on create', async () => {
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        ...testData,
        publishers: [{ publisher_id: randomId, publisher_result: 44 }],
      });

    expect(status).toBe(201);
    expect(body.publishers.length).toBe(0);
  });

  test('should return a not found error if advertiser_id not exist', async () => {
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        ...testData,
        advertiser_id: randomId,
      });

    expect(status).toBe(404);
    expect(body.message).toBe('advertiser_id not found');
  });

  test('should return a not found error if country_id not exist', async () => {
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        ...testData,
        countries_id: [randomId, randomId],
      });

    expect(status).toBe(404);
    expect(body.message).toBe(`countries_id [${randomId},${randomId}] not found`);
  });
});

describe.only('when to find campaogn', () => {
  test.todo('should return all campaigns');
  test.todo('should return campaign by id');
  test.todo('should return a not found error if id not exist');
  test.todo('should return the bests campaigns for the publisher');

  test.skip.each([
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
});
