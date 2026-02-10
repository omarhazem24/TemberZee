# TimberZee E-commerce Application

As the title would suggest, this is an all-in-one e-commerce system for a furniture and home decor brand. Right now it is meant to serve TimberZee customers but with very minimal changes it can serve any retail entity. Store managers (hereafter referred to as the Admin) can post and manage products, orders, and reviews, while users can view details of, wishlist, and purchase items on the system. Users can even manage their profiles and reset passwords using a secure WhatsApp OTP integration.

## Motivation
While this project was created as a robust practical learning experience of the MongoDB, Express, React, and Node stack (hereafter referred to as MERN), it actually is a viable project that we can see being very useful in the real world. It serves as a modern solution for digitalizing furniture retail.

## Build Status
On the more technical side, we are finalizing the core features, and all essential modules are now up and running (yes this implies our own custom features like WhatsApp OTP are in the pipeline - stay tuned!). Thankfully we have no system-breaking bugs (none that we found during many rounds of testing anyway). We have implemented secure Role-Based Access Control (RBAC) on both the frontend and backend to ensure data security.

## Code Style
On a lighter note, we coordinated our code style to be consistent so it would be easier for us to debug and maintain the implementation. In general, we follow standard JavaScript conventions: any camel cased identifier is a function name or variable, while components follow PascalCase.

## Screenshots
Below are some sample screenshots from our project UI:



## Tech/Framework
As mentioned before, the MERN stack, a JavaScript technology suite powers this project.

**MongoDB**  
A NoSQL, document-oriented database used to store application data (users, products, orders) in a JSON-like format.

**Express.js**  
The backend framework running on Node.js, responsible for handling server-side logic, routing, and APIs.

**React**  
A frontend JavaScript library used to build fast, interactive user interfaces with a great focus on reusability due to being component definition based.

**Node.js**  
The JavaScript runtime environment that powers the backend and allows JavaScript to run on the server.

These work hand in hand to provide a seamless full-stack development experience using JavaScript as the only programming language across the entire application.