## Description

Application for CreateorCart coding challenge.
Created with [Nest](https://github.com/nestjs/nest) framework.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Fixtures
On application start 2 brands and 3 users are added to DB (SQLite)

```
influencer1@mail.com
password: password
```

Influencer user that may upload, view and assign assets to brands.

```
manager1@flydubai.com
password: password
```

Brand manager user for "Fly Dubai" brand.

```
manager1@lufthansa.com
password: password
```

Brand manager user for "Lufthansa" brand.

Brand manager users may view assets assigned to corresponding brand. Approve or reject the assets. And download assets as ZIP file.