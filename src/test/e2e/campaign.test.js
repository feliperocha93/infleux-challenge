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
  bid: '1.00',
  advertiser_id: '',
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
let campaignId;

function cleanDb() {
  Advertiser.deleteMany({}, {}, () => null);
  Campaign.deleteMany({}, {}, () => null);
  Country.deleteMany({}, {}, () => null);
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

beforeAll(async () => {
  cleanDb();

  const { _id } = await Advertiser.create(advertiserData);
  testData.advertiser_id = _id.toString();

  const country = await Country.create({ name: 'China' });
  testData.countries_id.push(country._id.toString());

  await Campaign.create({ ...testData, bid: 20 });
  await Campaign.create({ ...testData, bid: 30 });
  const campaign = await Campaign.create({ ...testData, bid: 999 });
  campaignId = campaign._id;
});

afterAll(() => {
  server.close();
});

describe('when to store a campaign', () => {
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

  // TODO:
  test.todo('Quando criar uma campanha, deve atualizar no dono');
});

describe('when to find campaign', () => {
  test('should return all campaigns', async () => {
    const { body, status } = await request(server)
      .get(MAIN_ROUTE);

    expect(status).toBe(200);
    expect(body.length).toBe(5);
  });

  test('should return campaign by id', async () => {
    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/${campaignId}`);

    expect(status).toBe(200);
    expect(body.name).toBe(testData.name);
  });

  test('should return a not found error if id not exist', async () => {
    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/${testData.advertiser_id}`);

    expect(status).toBe(404);
    expect(body.error).toBe('campaign not found');
  });

  test('should return the bests campaigns for the publisher', async () => {
    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/fetch`)
      .query({ country_id: testData.countries_id[0] });

    expect(status).toBe(200);
    expect(body.length).toBe(3);
    expect(body[0].bid).toBe(999);
    expect(body[1].bid).toBe(30);
    expect(body[2].bid).toBe(20);
  });

  test.each([
    ['bid', 999, 1],
    ['bid', 1.00, 2],
    ['name', testData.name, 5],
    ['name', 'Say my name', 0],
    ['advertiser_id', '123654789', 0],
    ['publishers', [], 5],
  ])('when filter by %s equal %s, should return %i campaigns', async (field, value, lentgh) => {
    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/filter`)
      .query({ [field]: value });

    expect(status).toBe(200);
    expect(body.length).toBe(lentgh);
  });

  test('when filter by advertiser_id, should return 5 campaigns', async () => {
    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/filter`)
      .query({ advertiser_id: testData.advertiser_id });

    expect(status).toBe(200);
    expect(body.length).toBe(5);
  });

  test('when filter by countries_id, should return 5 campaigns', async () => {
    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/filter`)
      .query({ countries_id: [testData.countries_id[0]] });

    expect(status).toBe(200);
    expect(body.length).toBe(5);
  });
});

describe('when to update campaign', () => {
  describe.each([
    ['campaign_type', ['CCPC', 215]],
    ['bid', [-500, 0]],
    ['advertiser_id', ['s3a1s65a4s', 12564654]],
    ['countries_id', [['32156465', 1654654654], '55465465456']],
  ])('should return a bad request error if field is invalid', (field, values) => {
    test.each(values)('', async (value) => {
      const { body, status } = await request(server)
        .put(`${MAIN_ROUTE}/${campaignId}`)
        .send({
          [field]: value,
        });

      expect(status).toBe(400);
      expect(body.errors[0]).toBe(`${field} is invalid`);
    });
  });

  test.each(
    ['name', 'campaign_type', 'bid', 'advertiser_id'],
  )('should not create a campaign without %s', async (field) => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${campaignId}`)
      .send({ ...testData, [field]: null });

    expect(status).toBe(400);
    expect(body.errors[0]).toBe(`${field} is required`);
  });

  test('should return a not found error if id not exist', async () => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${randomId}`)
      .send({ name: 'Updated name' });

    expect(status).toBe(404);
    expect(body.error).toBe('campaign not found');
  });

  test('should update campaign', async () => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${campaignId}`)
      .send({ name: 'Updated name' });

    expect(status).toBe(200);
    expect(body.name).toBe('Updated name');
  });
});

describe.only('when to delete a campaign', () => {
  test('should delete a campaign', async () => {
    const { status } = await request(server)
      .delete(`${MAIN_ROUTE}/${campaignId}`);

    expect(status).toBe(204);

    const campaignPublisher = await Campaign.findById(campaignId);

    expect(campaignPublisher).toBeNull();
  });

  test('should return a not found error if campaign not exist', async () => {
    const { body, status } = await request(server).delete(`${MAIN_ROUTE}/${randomId}`);

    expect(status).toBe(404);
    expect(body.error).toBe('campaign not found');
  });

  test.todo('should remove campaign_id in publishers');
});

// TODO: Criar a controller add publisher/ remove publisher
