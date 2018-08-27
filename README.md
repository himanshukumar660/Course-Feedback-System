# Feedback System
This is a single page web application that can used as a feedback system for any group/organisation. All the user actions are performed via the REST API at the client side using AJAX.

# Features
1. User is able to create an account and log in. Password authentication is done through passport npm module.
2. 3 roles are implemented with different permission levels
    * Regular User: Can rate and leave a comment for a restaurant
    * Owner: Can create his own restaurants and reply comments about owned organisation
    * Admin: Can edit/delete all users, restaurants, comments, and reviews
3. Reviews have:
    * A 5 star based rate
    * Date on which the review was made
    * Comment
4. When a Regular User logs in he will see the restaurant List ordered by Rate Average
5. When an Owner logs in he will see a the course list of only the ones owned by him, and the reviews pending to reply
(Owners can reply the review once).
6. Restaurants detailed view should have:
    * The overall average rating
    * The highest rated review
    * The lowest rated review
    * Last reviews with rate, comment, and reply
7. Course list can be filtered by Rating
8. Regex Search for all the restaurants available.
9. All the APIs are RESTful in nature.

# Security Features
1. Each access to API is protected by several middleware layer that if the client should be made access to the resource.
2. Each input by the user is protected from common Security vulnerabilities.
3. Each input is sanitized both at the client side and server side to provide required level of protection from XSS, Cross-site scripting etc.

# APIS list
1. `GET /`
2. `GET /userInfo`
3. `GET /outlet`
4. `GET /outlet/outletId/:outletId`
5. `GET /outlet/to_reply/:outletId`
6. `GET /outlet/:userId`
7. `GET /outlet/reviews/:outletId`
8. `GET /users/`
9. `GET /outlet/regex/:pattern`
10. `GET /outlet/regex/user/:pattern`
11. `POST /outlet/`
12. `PUT /outlet/review/:outletId`
13. `PUT /outlet/reply/:outletId/:reviewId`
14. `PUT /users/change/:priority/:userId`
15. `DELETE /outlet/:outletId`
16. `DELETE /outlet/review/:outletId/:reviewId`
17. `DELETE /users/:userId`
18. `POST /user/register`
19. `POST /user/login`
20. `GET /user/logout`

# SetUp
To set up the development environment, you need to follow the following steps
1. Download npm and nodeJs. Installation guide can be found [here](https://www.joyent.com/blog/installing-node-and-npm)
2. Download and install MongoDB on your system.

# Running the Project
To run the project on local server, first navigate to the project directory in your filesystem.
1. Now create a directory `/data/db` in the location where your project folder resides.
2. Now run `mongod --dbpath=./data/db` from the current directory.
3. Now run `cd reviewsys`, or go inside the project folder.
4. Now run `nodemon start` in the terminal.
5. Open `localhost:3000` from your favourite browser.
