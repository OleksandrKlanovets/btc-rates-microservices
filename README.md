# BTC-UAH exchange rates app (using microservice architecture)

## Description

The app consists of 2 microservices:
- Auth microservice, responsible for user sign on/in and session management using JWT;
- BTC-UAH rates microservice, responsible for giving a user a current BTC-UAH exchange rate.

Both services have logging on debug, info and error levels. The logs are sent to the RabbitMQ.
There is also a logs handling worker, which consumes the error logs and sends them to stdout.

The required version of Node.js is 14+.

## Installation

1. Clone the repo:
```bash
$ git clone https://github.com/AlexanderKlanovets/btc-rates-microservices
$ cd btc-rates-microservices
```

2. Install dependencies for both services and error handling worker (RabbitMQ consumer):
```bash
$ cd auth-service
$ npm i
$ cd ../btc-rates-service
$ npm i
$ cd ../logs-handling-worker
$ npm i
```

3. Initialize the environment variables according to the table:

|Variable|Description|Value example|
|---|---|---|
|PORT|An HTTP server port.|3000|
|JWT_SECRET|A secret to use to verify the JWT, for the auth service only.|very_secret_wow|
|DATA_PATH|A path to a folder to store users and refresh tokens, for the auth service only.|./data|
|AUTH_SERVICE_URL|A URL of the auth service, so that a BTC Rates service can use it to communicate via HTTP. For the BTC Rates service only.|http://localhost:3000|
|DEBUG_MODE|Turns on/off debug logs. For both services. 0 - for no logs; 1 - enables debug logs.|1|
|AMQP_URL|RabbitMQ server URL.|amqp://localhost|

4. Run RabbitMQ inside Docker:
```bash
$ docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.9-management
```

5. After the RabbitMQ successful launch, run the microservices (inside each service directory):
```bash
$ npm run start
```

6. *Optional*: run in dev mode with file system watch (inside each service directory):
```bash
$ npm run start:dev
```

7. Run the error handling worker (inside `logs-handling-worker` directory):
```bash
$ AMQP_URL=<your_amqp_url> node main.js
```

## API description

### Auth service:

1. Create (register) a user:

| Method | Endpoint |
|--------|----------|
| POST | /user/create |

```bash
# Request example:

curl --request POST 'localhost:3000/user/create' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test@mail.com",
    "password": "123456"
}'
```

Response example:
```json
{
    "message": "Successfully registered."
}
```

2. Login:

| Method | Endpoint |
|--------|----------|
| POST | /user/login |

```bash
# Request example:

curl --request POST 'localhost:3000/user/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test@mail.com",
    "password": "123456"
}'
```


Response example:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjQ5Njk1NjgsImVtYWlsIjoidGVzdEBtYWlsLmNvbSIsImlhdCI6MTYyNDk2ODY2OH0.KdBbEVdwBMEYGdxXkDafq3eiKswtFq_AYd9oc2N_XV0",
    "refreshToken": "72d91613-e9f7-46b7-91ef-1b487f9dcc65"
}
```

3. Refresh access token:

| Method | Endpoint |
|--------|----------|
| POST | /user/refresh |

```bash
# Request example:

curl --request POST 'localhost:3000/user/refresh' \
--header 'Content-Type: application/json' \
--data-raw '{
    "refreshToken": "<your_refresh_token>"
}'
```

Response example:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjQ5NzEwMzEsImVtYWlsIjoidGVzdEBtYWlsLmNvbSIsImlhdCI6MTYyNDk3MDEzMX0.55gKUMuyZhxR88PQzF-OkE7PdqjwAxEA1UogpjijUMk",
    "refreshToken": "419fe0d0-60ec-4555-a34e-72ad7aa65678"
}
```

4. Logout:

| Method | Endpoint |
|--------|----------|
| POST | /user/logout |

```bash
# Request example:

curl --request POST 'localhost:3000/user/logout' \
--header 'Authorization: Bearer <your_access_token>'
```

Response example:
```json
{
    "message": "Logout successful."
}
```

### BTC rates service:

1. Check the exchange rate for BTC-UAH pair:

| Method | Endpoint |
|--------|----------|
| GET | /btcRate |

```bash
# Request example:

curl 'localhost:3000/btcRate' \
--header 'Authorization: Bearer <your_access_token>'
```

Response example:
```json
{
    "btcUahExchangeRate": 1008852
}
```
