import json
from flask import Flask, request, jsonify
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager
from dotenv import load_dotenv, find_dotenv
import os

# import sys

# print(sys.path)

# import database as db # otherwise it looks somewhere else

from user import database as db # i think the issue is that this is run from the main run.py script
# so the path is relative to there

# from backend.user.database import *

''' EXAMPLE OF MAKING QUERY
rows = db.make_query("SELECT * FROM USERS")
for row in rows:
    print(row)
'''

load_dotenv(find_dotenv())

app = Flask(__name__)

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1) # set the expiration time for access token
jwt = JWTManager(app)

@app.after_request # run this func after user makes a request to /profile endpoint
def refresh_expiring_jwts(response): # response after hitting that endpoint
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30)) # 30 min from now
        if target_timestamp > exp_timestamp: # less than 30 min away from expiring
            access_token = create_access_token(identity=get_jwt_identity()) # create a new token for user
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

# for logging in a new user
# creates access token and returns it
@app.route('/login', methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    # check if username and password is in the database
    if db.user_exists(username, password):
        access_token = create_access_token(identity=username)

        # print("USER EXISTS")

        return {"success": True,
                "access_token": access_token}, 200
    else: # json body and then error code
        return {
            "success": False,
            "msg": "Wrong username or password"
        } # DO NOT RETURN ERROR CODE IF NOT 200 OK, OTHERWISE IT INTERRUPTS FLOW ON CLIENT RENDERING

# for registering a new user
# creates access token and returns it
@app.route('/register', methods=["POST"])
def register():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    # check if username is in the database
    if db.user_exists(username):
        return {
            "success": False,
            "msg": "Username already exists"
        }
    else:
        db.create_user(username, password)
        access_token = create_access_token(identity=username)
        return {"success": True,
                "access_token": access_token}, 200

@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response) # delete the cookies storing the access token
    return response

@app.route('/profile')
@jwt_required() # require JWT auth. If not provided, shows "missing auth header"
def my_profile():
    response_body = {
        "name": "Nagato",
        "about" :"Hello! I'm a full stack developer that loves python and javascript"
    }

    return response_body

@app.route('/')
def home():
    return "<h1>Base test<h1>"