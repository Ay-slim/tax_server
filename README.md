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
