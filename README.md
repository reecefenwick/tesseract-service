# OCR as A Service

## Prerequisites

Requires `MongoDB`

Requires `RabbitMQ Server`

Requires `Tesseract OCR (latest)`


## Deploying locally


Console source via git and `cd` to folder:

    Clone Repository - https://github.com/reecefenwick/tesseract-service.git


Install dependencies via npm:

    npm install

## Tests

Install `mocha` globally:

    npm install mocha -g
    
Run the tests

    npm test

## Run API Server

via node:

    node server
    
## Run Worker

via node from /workers directory:

    node receive

## Documentation

* API Documentation - http://docs.ocr3.apiary.io/

## Application Sequence

1. Client -Upload file via POST to /job - job _id is returned
2. API - adds a message to queue
3. Worker - receive the message off the queue
4. Worker - processes file and updates database
5. Client - Polls via GET to /job/{_id}

## Things to note

* Basic demo has been setup - navigat to http://localhost:3000/demo
* Only images are supported currently - PDF input will come later
* Worker will eventually become its own standalone project
