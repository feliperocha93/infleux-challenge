# Challenge Infleux – Backend

This is an API to connect advertisers to publishers. The advirtisers can create campaigns and the publishers can get it and to receive a pay for results.

## Authors

- [@feliperocha93](https://github.com/feliperocha93)

## Tech Stack

**Server:** Node, Express  
**Database:** MongoDB  
**Tests:** Jest, Supertest  

## Run Locally

Clone the project

```bash
  git clone https://github.com/feliperocha93/infleux-challenge
```

Go to the project directory

```bash
  cd infleux-challenge
```

Install dependencies

```bash
  yarn install
```

Start the server

```bash
  yarn start:dev
```


## Running Tests

To run tests and get coverage, run the following command

```bash
  yarn test
```

To run tests and watch changes

```bash
  yarn test:watch
```


## Collection

In the thunder_client folder, there is the API collection. To use it, you need download Thunder Client extension and import collection and env files that are inside the folder.

First, click in Collections (Thunder Client NavBar - on the top) > import > select ```thunder-collection_Infleux Challenge.json```. After it, click in Env > import > select ```thunder-environment_Infleux Challenge.json```

