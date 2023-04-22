# SWAM-Flask-CourseProject
A little expense manager which exposes a REST API. 
The backend is developed with Flask, the frontend with Ionic V5 and Angular.

UI is from [Appichetto](https://github.com/fede-vaccaro/HCI-Project-Appichetto).

## Installation
Front-end:
```
# from root folder
$ cd client/
$ sudo npm install
$ npm install -g @ionic/cli
```

Back-end:
```
# from root folder
$ cd server/
$ pip install -r requirements.txt
$ export FLASK_APP=main.py
$ flask shell
> db.create_all()
> quit()
```
---
### Starting the application
Back-end:
```
$ python main.py
```
Front-end:
```
$ ionic serve
```
