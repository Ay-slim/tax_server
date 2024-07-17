# Taxify

## Description

Backend system containing API routes and Database logic for Taxify, a simple tax management tool

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev
```

## Test

```bash
# unit tests
$ yarn run test
```

## Structure

- This codebase is structured based on system domain.
- Each entity (user, tax_deduction, summary, country) contains its own controller module, services, and utils and can easily be extracted into a microservice should the need arise

## Todo

- Develop a rule engine structure (preferably separate module + db schema, thinking about that is still sketchy atm) to map things like exemptions and reliefs to countries, if/else or switch statements for this can get messy real quick
- Depending on how quickly this moves, set up an admin dashboard for creating rules etc, postman isn't likely to scale

## Deployment

Currently running on Render
Cron running from https://console.cron-job.org/ keeps the server from sleeping
