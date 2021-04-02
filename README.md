# Mongo-ACID-Transactions

## API

### POST `/transaction` 

should create 2 documents 1 in the `pizza` collection and 1 in the `drinks` collection

## Standalone

- Run the application using `node main.js`
- Post request on `localhost:4000/transaction`

Expected: insert the 2 documents into the database
Actual: Fails with error

## Replica set

- Uncomment the replica set line from `.env` file
- Run the application using `node main.js`
- Post request on `localhost:4000/transaction`

Expected: insert the 2 documents into the database
Actual: inserts successfully

## Test roll-back

- Uncomment line `48` __or__ Add `throw new Error();` between the insertion of the pizza document and the drinks document
