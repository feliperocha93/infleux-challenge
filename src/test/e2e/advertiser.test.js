const request = require('supertest');
const mongoose = require('../../database');

const Advertiser = require('../../app/models/Advertiser');
const Campaign = require('../../app/models/Campaign');
const Country = require('../../app/models/Country');

const server = require('../../index');

const MAIN_ROUTE = '/advertisers';

const testData = {
  name: 'Advertiser Name',
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

function cleanDb() {
  Advertiser.deleteMany({}, {}, () => null);
  Campaign.deleteMany({}, {}, () => null);
  Country.deleteMany({}, {}, () => null);
}

beforeAll(async () => {
  cleanDb();

  const { _id } = await Advertiser.create(advertiserData);
  campaignData.advertiser_id = _id.toString();

  const country = await Country.create({ name: 'China' });
  campaignData.countries_id.push(country._id.toString());

  const campaign = await Campaign.create(campaignData);
  campaignId = campaign._id;
});

afterAll(() => {
  server.close();
});

describe('when to store a advertiser', () => {
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
        campaigns_id: [campaignId],
      });

    expect(status).toBe(201);
    expect(body.campaigns_id.length).toBe(0);
  });
});

describe('when to find a advertiser', () => {
  const name = 'Find Test';
  let findTestId;

  beforeAll(async () => {
    const { _id } = await Advertiser.create({ name });
    findTestId = _id;
    Advertiser.create({ name: testData.name });
  });

  test('should return all advertiser', async () => {
    const { body, status } = await request(server)
      .get(MAIN_ROUTE);

    expect(status).toBe(200);
    expect(body.length).toBe(5);
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
    ['name', name, 1],
    ['name', testData.name, 4],
  ])('should return advertiser by filters', async (filter, value, length) => {
    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/filter`)
      .query({ [filter]: value });

    expect(status).toBe(200);
    expect(body.length).toBe(length);
  });
});

describe('when to update a advertiser', () => {
  const name = 'Update Test';
  let updateTestId;

  beforeAll(async () => {
    const { _id } = await Advertiser.create({ name });
    updateTestId = _id;
    Advertiser.create({ name: testData.name });
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

  test('should return a not found error if advertiser not exist', async () => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${randomId}`)
      .send({
        name: testData.name,
      });

    expect(status).toBe(404);
    expect(body.error).toBe('advertiser not found');
  });

  test('should not update campaigns_id', async () => {
    const { body, status } = await request(server)
      .put(`${MAIN_ROUTE}/${updateTestId}`)
      .send({
        campaigns_id: [campaignId],
      });

    expect(status).toBe(400);
    expect(body.error).toBe('campaigns_id can not be updated');
  });
});

describe('when to delete a advertiser', () => {
  const name = 'Delete Test';
  let deleteTestId;

  beforeAll(async () => {
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

  test('should delete advertiser and remove all of its campaigns', async () => {
    const { status } = await request(server)
      .delete(`${MAIN_ROUTE}/${campaignData.advertiser_id}`);

    expect(status).toBe(204);

    const campaigns = await Campaign.find({ advertiser_id: campaignData.advertiser_id });

    expect(campaigns.length).toBe(0);
  });

  test('should return a not found error if advertiser not exist', async () => {
    const id = mongoose.Types.ObjectId();

    const { body, status } = await request(server).delete(`${MAIN_ROUTE}/${id}`);

    expect(status).toBe(404);
    expect(body.error).toBe('advertiser not found');
  });
});
