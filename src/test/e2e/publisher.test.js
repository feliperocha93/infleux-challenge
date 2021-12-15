const request = require('supertest');
const mongoose = require('../../database');

const Advertiser = require('../../app/models/Advertiser');
const Campaign = require('../../app/models/Campaign');
const Country = require('../../app/models/Country');
const Publisher = require('../../app/models/Publisher');

const server = require('../../index');

const MAIN_ROUTE = '/publishers';
const CAMPAIGN_ROUTE = '/campaigns';

const testData = {
  name: 'Publisher Name',
  country_id: '',
};

const campaignData = {
  name: 'Nova Campanha',
  campaign_type: 'CPC',
  bid: '1.00',
  advertiser_id: '',
  countries_id: [],
};

const advertiserData = {
  name: 'Advertiser Name',
};

const randomId = mongoose.Types.ObjectId();
let campaignId;

async function cleanDb() {
  Advertiser.deleteMany({}, {}, () => null);
  Campaign.deleteMany({}, {}, () => null);
  Country.deleteMany({}, {}, () => null);
  Publisher.deleteMany({}, {}, () => null);
}

beforeAll(async () => {
  cleanDb();

  const { _id } = await Advertiser.create(advertiserData);
  campaignData.advertiser_id = _id.toString();

  const country = await Country.create({ name: 'China' });
  campaignData.countries_id.push(country._id.toString());
  testData.country_id = country._id.toString();

  const campaign = await Campaign.create(campaignData);
  campaignId = campaign._id;
});

afterAll(() => {
  server.close();
});

describe('when to store a publisher', () => {
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
    [null, undefined, NaN],
  )('should not create a publishers without name', async (name) => {
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        ...testData,
        name,
      });

    expect(status).toBe(400);
    expect(body.errors[0]).toBe('name is required');
  });

  test.each(
    [null, undefined, NaN, ''],
  )('should not create a publishers without country_id', async (country_id) => {
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        ...testData,
        country_id,
      });

    expect(status).toBe(400);
    expect(body.errors[0]).toBe('country_id is required');
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
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        ...testData,
        campaigns_id: [campaignId],
      });

    expect(status).toBe(201);
    expect(body.campaigns_id.length).toBe(0);
  });

  test('should not create if country_id is invalid', async () => {
    const { body, status } = await request(server)
      .post(MAIN_ROUTE)
      .send({
        ...testData,
        country_id: '123456',
      });

    expect(status).toBe(400);
    expect(body.errors[0]).toBe('country_id is invalid');
  });
});

describe('when to find a publisher', () => {
  const localName = 'Find Test';
  let findTestId;

  beforeAll(async () => {
    const { _id } = await Publisher.create({ ...testData, name: localName });
    findTestId = _id;
    Publisher.create(testData);
  });

  test('should return all publishers', async () => {
    const { body, status } = await request(server)
      .get(MAIN_ROUTE);

    expect(status).toBe(200);
    expect(body.length).toBe(4);
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
    [testData.name, undefined, 3],
    [undefined, '123456abcdef', 0],
  ])('when filter by %s and %s should return %i publishers by filters', async (name, country_id, lentgh) => {
    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/filter`)
      .query({ name, country_id });

    expect(status).toBe(200);
    expect(body.length).toBe(lentgh);
  });
});

describe('when to update a publisher', () => {
  const localName = 'Update Test';
  let updateTestId;

  beforeAll(async () => {
    const { _id } = await Publisher.create({ ...testData, name: localName });
    updateTestId = _id;
    Publisher.create(testData);
  });

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

  test('should update publisher name', async () => {
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

  test('should update publisher country_id', async () => {
    const country = await Country.create({ name: 'Chile' });
    const country_id = country._id.toString();

    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${updateTestId}`)
      .send({
        country_id,
      });

    expect(status).toBe(200);
    expect(body.country_id).toBe(country_id);

    const documentUpdated = await Publisher.findById(updateTestId);

    expect(documentUpdated.country_id).toBe(country_id);
  });

  test('should return a bad request error when try update campaign_id', async () => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${updateTestId}`)
      .send({
        campaigns_id: [campaignId],
      });

    expect(status).toBe(400);
    expect(body.error).toBe('campaigns_id can not be updated');
  });
});

describe('when to delete a publisher', () => {
  const localName = 'Delete Test';
  let deleteTestId;

  beforeAll(async () => {
    const { _id } = await Publisher.create({ ...testData, name: localName });
    deleteTestId = _id;
    Publisher.create(testData);
  });

  test('when removing a publisher should remove its id from the campaigns it was part', async () => {
    const publisher = await Publisher.create(testData);
    const publisherId = publisher._id.toString();

    await request(server)
      .post(`${CAMPAIGN_ROUTE}/${campaignId}/publishers`)
      .send({ publisher_id: publisherId });

    const { status } = await request(server)
      .delete(`${MAIN_ROUTE}/${publisherId}`);
    expect(status).toBe(204);

    const campaign = await Campaign.findById(campaignId);
    const publishersId = campaign.publishers.map((pub) => pub.publisher_id.toString());

    expect(publishersId.includes(publisherId)).toBeFalsy();
  });

  test('should return a not found error if publisher not exist', async () => {
    const { body, status } = await request(server)
      .delete(`${MAIN_ROUTE}/${randomId}`);

    expect(status).toBe(404);
    expect(body.error).toBe('publisher not found');
  });

  test('should delete publisher', async () => {
    const { status } = await request(server)
      .delete(`${MAIN_ROUTE}/${deleteTestId}`);

    expect(status).toBe(204);

    const deletedPublisher = await Publisher.findById(deleteTestId);

    expect(deletedPublisher).toBeNull();
  });
});
