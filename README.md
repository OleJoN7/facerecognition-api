# Facerecognition-api
Just deploy this file in independept repository.
 
# This is server RESTful Api for face-recognition application 

In this api i am using express server for deploying a server,bodyParser module to have access to "request body" from frontend

Clarifai module - is Api for face recognition,also imported to server.js -  its better way to keep my Api key in safe so it should be on backend side

bcript module - for more secure passwords of users,not only using post request to store data in body of request but also additionally encrypt passwords(its using hash)

cors module - its a middleware,to let browser know that our server is secured and we can communicate our frontend part with backend.(can make request and get response)

knex module - it is a tool, the way to communicate database with server,i am using postgreSQL so in options client is 'pg'(installed as module in project)

Also for testing - connection server with db, for making requests and getting response i used Postman tool. 
