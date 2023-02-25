# E-commerce API

This is a backend application built with NodeJS that provides an API for an E-commerce website. The API allows clients to create and manage products, categories, and orders, as well as handle authentication and authorization of users.

## Installation

To use this application, follow these steps:

1. Clone this repository to your local machine using

```
git clone https://github.com/yodkwtf/nodejs-e-commerce-api.git
```

2. Change into the directory:

```
cd nodejs-e-commerce-api
```

3. Install the required dependencies:

```
npm install
```

## Usage

To start the server, run the following command:

```sh
npm start
```

The server will start listening on `http://localhost:5000`. You can use a REST client like Postman or Insomnia to interact with the API.

## API Endpoints

The following API endpoints are available:

- GET `/api/products`: Returns a list of all products.

- GET `/api/products/:id`: Returns details for a specific product.

- POST `/api/products`: Creates a new product.

- PUT `/api/products/:id`: Updates a product.

- DELETE `/api/products/:id`: Deletes a product.

- GET `/api/categories`: Returns a list of all categories.

- GET `/api/categories/:id`: Returns details for a specific category.

- POST `/api/categories`: Creates a new category.

- PUT `/api/categories/:id`: Updates a category.

- DELETE `/api/categories/:id`: Deletes a category.

- POST `/api/users/register`: Registers a new user.

- POST `/api/users/login`: Authenticates a user and generates a JSON Web Token (JWT).

- GET `/api/orders`: Returns a list of all orders.

- GET `/api/orders/:id`: Returns details for a specific order.

- POST `/api/orders`: Creates a new order.

## Authentication

Some of the API endpoints require authentication using a JWT. To authenticate a user, send a POST request to `/api/users/login` with the user's email and password. The server will respond with a JWT, which should be included in subsequent requests as an Authorization header:

```makefile
Authorization: Bearer <jwt-token-here>
```

## Configuration

Before you can use the application, you need to create a .env file in the root directory of the application with the following environment variables:

```makefile
MONGO_URI=<your-mongodb-uri-here>
JWT_SECRET=<your-jwt-secret-here>
JWT_LIFETIME=2d
```


## Packages

#### [express-async-errors](https://github.com/davidbanham/express-async-errors#readme)

When we write a controller function, we wrap everything in try-catch block. Doing that for every controller is a bit tedious so we use the package to do that automatically for us.

#### [morgan](https://github.com/expressjs/morgan#readme)

Tells us which route we're hitting along with the status code after every request, really useful for debugging. We can also set it up to work for development only.

#### [validator](https://github.com/validatorjs/validator.js)

Used to automatically validate emails entered by the users instead of manually setting up regex.

#### [cookie-parser](https://github.com/expressjs/cookie-parser#readme)

Used to parse the cookies send by the browser to get them as a token. Express helps us in setting up cookies but there's no built in way to parse them.

## Q/As

**Q. Why do we need `express.json()` middleware?**

**A.** So we have access to the json data in _req.body_

**Q. Why are we sending signed cookies?**

**A.** Although we can still copy a signed cookie from Chrome and use the same signed cookie on another browser (Mozilla) and can access the data or whatever we needed but we still send signed cookies to figure out if the user has tampered with the data or not.

**Q. Why do we have `router.route('/:id').get(getSingleUser)` as the last route in user routes?**

**A.** Since we're passing the id in this one, if we have this route before a route like `/showMe` then express will take the `showMe` part of the query params as the id.

**Q. Why are we using `if (!this.isModified('password'))` in User model's save function?**

**A.** Because otherwise we end up hashing the passwords everytime a user updates his name/email and we only wanna hash password if it's modified otherwise they wont be able to login after modifying their name/email.

**Q. Why do we need `checkPermissions` utils function?**

**A.** Otherwise any user who's logged in will be able to access the getSingleUser route if he has the ID of any other user and hence accessing their data.

**Q. Why do we use `populate` method?**

**A.** Allows us to reference documents from other collections and get additional info about the them. For eg, when getting all reviews, we can use the method to get info about that product or the user who's review it is.

**Q. What are `mongoose virtuals`?**

**A.** Think of them as properties that do not exist in the database and only exist logically. We create them on the fly when we wanna compute something.

**Q. What are we using `await product.save()` or `await product.remove()` instead of findOneAndUpdate?**

**A.** When we are updating/deleting products we are also updating/deleting their specific reviews side by using the `pre` hook in the model. Using the `.save()` or `.remove()` triggers that hook where as `findOne` ones don't.

**Q. What is the difference between `instance methods` and `static methods`?**

**A.** Both are defined in the model only but we call instance methods on the schema instances in controller whereas static methods are directly invoked on the schema itself (for eg. calcAvgRating).

**Q. Why so many validations in `createOrder` controller?**
**A.** So the role of backend is to verify everything and check data the data as well as stripe clientSecret is valid. If not, the user simply would not be able to enter the `/checkout`[ref. to furniture world] page.

#### Notes

- In this API, only the admin user has the access to CRUD operations and since we are checking for authentication via middlewares, we don't need to check and compare userID in the controllers.

- However, if there are multiple admin roles with multiple access, we would need to comapre the userID with the user that was attached to the product initially and only if they match then the current user would be able to perform functionality.

- Suppose `product B` was created by a logged user `X` so we attached the X's user id as the user key on `product B`. Now when the user X request a CRUD route, we will check if the product.user matches X.userId and only then allow him to do the tasks.

- All this isn't implemented in this particular project but that's how it'll work in real life.
