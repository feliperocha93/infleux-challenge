const request = require('supertest');
const Advertiser = require('../../app/models/advertiser');

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

describe.skip('when to store a advertiser', () => {
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

  beforeAll(() => {
    cleanDb();
    findTestId = Advertiser.create({ name });
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
    const { body, status } = await request(server)
      .get(`${MAIN_ROUTE}/${findTestId}1`);

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
describe.skip('when to update a advertiser', () => {});
describe.skip('when to delete a advertiser', () => {});