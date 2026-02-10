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

<img width="1526" height="588" alt="Screenshot 2026-02-10 034016" src="https://github.com/user-attachments/assets/7cf505e2-d5cb-473a-a608-03174d0d7795" />
<img width="1241" height="924" alt="image" src="https://github.com/user-attachments/assets/a058a974-738c-4721-98ac-412cedb7e90f" />
<img width="1526" height="588" alt="image" src="https://github.com/user-attachments/assets/6146c801-f8af-47c0-8e69-2d28c2bb12d0" />
<img width="260" height="177" alt="Screenshot 2026-02-10 034812" src="https://github.com/user-attachments/assets/fa5aad76-00e2-4dcd-905c-2d78269f1d06" />
<img width="1351" height="490" alt="Screenshot 2026-02-10 034536" src="https://github.com/user-attachments/assets/f9be3abf-1a14-4452-928a-a6a1f581fae2" />
<img width="1374" height="491" alt="Screenshot 2026-02-10 034527" src="https://github.com/user-attachments/assets/40e3fb9a-e707-426f-ac61-fb9f1646a736" />
<img width="1609" height="291" alt="Screenshot 2026-02-10 034521" src="https://github.com/user-attachments/assets/75193182-a50b-443d-9e06-fdbe56f28e1a" />
<img width="1918" height="957" alt="Screenshot 2026-02-10 034516" src="https://github.com/user-attachments/assets/54b410be-3b4f-4661-b553-d88da9dcc67a" />
<img width="1019" height="661" alt="Screenshot 2026-02-10 034429" src="https://github.com/user-attachments/assets/5569d725-9d9b-413e-8624-91d20844a039" />
<img width="1121" height="957" alt="Screenshot 2026-02-10 034424" src="https://github.com/user-attachments/assets/681e6e3b-ddaa-49ed-a217-81e740c37ebf" />
<img width="1085" height="464" alt="Screenshot 2026-02-10 034105" src="https://github.com/user-attachments/assets/2cf65895-fa2b-4bbf-b680-65b5ccb901dc" />
<img width="1426" height="212" alt="Screenshot 2026-02-10 034059" src="https://github.com/user-attachments/assets/bb33a740-287e-456e-982f-8288ab990204" />
<img width="1517" height="848" alt="Screenshot 2026-02-10 034049" src="https://github.com/user-attachments/assets/4ad5c6e6-28b0-43c8-8719-a8af03f633e1" />
<img width="1439" height="461" alt="Screenshot 2026-02-10 034036" src="https://github.com/user-attachments/assets/2ba8d587-7d8d-4f3d-89cc-4a9bfb6f7d17" />
<img width="1466" height="398" alt="Screenshot 2026-02-10 034029" src="https://github.com/user-attachments/assets/4b90bb97-24fc-4bf1-b65b-b88139673d5c" />
<img width="1379" height="295" alt="Screenshot 2026-02-10 034024" src="https://github.com/user-attachments/assets/0618d010-9a2e-4e0f-8716-1049e910012c" />
<img width="857" height="895" alt="Screenshot 2026-02-10 034826" src="https://github.com/user-attachments/assets/c37409ab-1e95-4d8a-a54d-dae8c26dcdbe" />


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
