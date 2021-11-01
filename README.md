# 📃 Taskway Server

## See preview here: https://taskway.tk/
## See API docs here: https://taskwayservice.herokuapp.com/
## Client Repository: https://github.com/GiovannaK/taskway-client

### Demo Credentials
- E-MAIL: demo@cloud-mail.top
- PASSWORD: taskway1
---

<p align="center">
  <a href="#description">Description</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#Features">Features</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#how-to-use">How to Use</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#license">License</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#author-info">Author Info</a>
</p>

---

## Description
### Taskway is a web application to manage tasks in real time using workspaces.

## Technologies

### Back-end
- PostgreSQL
- Sequelize
- GraphQL
- Apollo Server
- Express
- Jest

### Services

- SendGrid to send email https://sendgrid.com/

- S3 BUCKET for image and file upload
https://aws.amazon.com/pt/

---
# Features

## WORKSPACES

- Users can create workspaces.

- Users can add workspace members by email.

- Envited users can see workspace to which they were invited appear in real time.

- Only workspace owner can delete the workspace.

- Tasks creation and editon are shown in real time to all workspace members

## WORKSPACE MEMBERS

- Only workspace owner can add or remove new members

- When a workspace member is removed, all associated permissions are removed.

## PERMISSION

- Only workspace owners can assign permissions to workspace members, you can see the options below:

- Workspace owner has all permissions below

- Create Task

- Update Task

- Delete Task

## TASK

- Only users who have the create task permission, can create new tasks.

- Tasks have the following fields:

- Title
- Description
- Link (Optional)
- File (Optional)
- Time (Optional)
- Assignment (Only workspace members)

## TASK COMMENTS (Subscriptions)

- It is possible to add comments to tasks

- They are shown in real time

## WORKSPACE CHAT (Subscriptions)
- Chat room can be created optionally by workspace owner

- All workspace members can participate

### REGISTRATION

### Users can register using email and password.

### ACCOUNT ACTIVATION
- When a user finish registration proccess, before login, the account must be activated. A short expiration token will be sent to the user's email.

### LOGIN

- It is possible to log in using e-mail and password, if account is not activated it will not be possible to login.

### FORGOT PASSWORD

- Users can recover access to the account by requesting a password change.
- A short expiration token will be sent to the user's email with a link to the password reset form.

### PROFILE

- Users can change their personal data and add a profile picture

---
## ❗ How To Use

### Run locally

### Clone the project

```html
git clone https://github.com/GiovannaK/taskway.git
```
### Assuming you already have NodeJS and npm installed and properly configured: Run the command below to install all required dependencies

```html
npm install
```
### Creating Environment variables.

- create a .env file in the root folder

- Then add the following information and your credentials

```html
SENDGRID_API_KEY = your sendgrid API KEY

EMAIL_HOST_USER = Your E-MAIL HOST to send emails to users

TOKEN_SECRET = JWT TOKEN SECRET

TOKEN_EXPIRATION = TOKEN EXPIRATION

DB_HOST = Database host
DB_USER = Database username
DB_PASS = Database password
DB_NAME = Database Name
DB_PORT = Database Port

# S3 BUCKET
AWS_ACCESS_KEY_ID = AWS ACCESS KEY

AWS_BUCKET_NAME = BUCKET NAME

AWS_DEFAULT_REGION = BUCKET REGION

AWS_SECRET_ACCESS_KEY = AWS SECRET

REDIS_HOST = REDIS HOST FOR SUBSCRIPTIONS
REDIS_PORT = REDIS PORT

CLIENT_URL = CLIENT URL, YOU CAN GET HERE
https://github.com/GiovannaK/taskway-client.git

COOKIE_SECURE = DEFINE TO FALSE IF YOU ARE IN LOCALHOST

PORT = PORT TO RUN THE APPLICATION

```

### Environment variables for test

### Please add a .env.test file in root folder and set your test environment.

```html
DB_DIALECT = sqlite

SENDGRID_API_KEY = SENDGRID_API_KEY
EMAIL_HOST_USER = Your E-MAIL HOST USER
TOKEN_SECRET = YOUR TOKEN SECRET
TOKEN_EXPIRATION = Token Expiration

PORT = PORT TO RUN APPLICATION

REDIS_HOST = REDIS HOST
REDIS_PORT = REDIS PORT

CLIENT_URL = Client URL

COOKIE_SECURE = Cookie Secure

# S3 BUCKET
AWS_ACCESS_KEY_ID = AWS ACCESS KEY

AWS_BUCKET_NAME = BUCKET NAME

AWS_DEFAULT_REGION = BUCKET REGION

AWS_SECRET_ACCESS_KEY = AWS SECRET
```

### Disable Database SSL

```html
  src/config/config.js

  add a comment to this snippet

/*   dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  }, */

```

### Docker
- Assuming you already have the docker installed and properly configured.

```html
docker-compose up
```
### You may need these commands:

- Stop it all running

```html
docker-compose down
```

- In case you change something in docker-compose.yml

```html
docker-compose build
```

- In case you need to build only one container

```html
docker-compose build containername
```
---

## 📌 License

MIT License

Copyright (c) [2020]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Author Info

- Linkedin - [Giovanna Cunha](https://www.linkedin.com/in/giovanna-kelli/)
