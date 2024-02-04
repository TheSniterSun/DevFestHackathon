import json
from flask import Flask, request, jsonify
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager
from dotenv import load_dotenv, find_dotenv
import os

from datetime import datetime
from datetime import date

import googlemaps
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

import constants

# ALSO INCLUDES THE GOOGLE MAPS AND SHEETS CODE

# import sys

api_key = "AIzaSyAhimgBVdhSl442oTbEY4YY2zDHRzR3xhw"
gmaps = googlemaps.Client(key=api_key)

# print(sys.path)

# import database as db # otherwise it looks somewhere else

from user import database as db # i think the issue is that this is run from the main run.py script
# so the path is relative to there

from flask_cors import CORS

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

CORS(app)

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

def geocode_address(address):
    try:
        geocode_result = gmaps.geocode(address)
        if geocode_result:
            location = geocode_result[0]['geometry']['location']
            return location['lat'], location['lng']
    except Exception as e:
        print(f"Geocoding failed for address: {address}. Error: {e}")
    return None, None

@app.route("/submitData", methods=["POST"])
def submitData():

    data = request.json.get("dataa", None)

    print(data)

    street = data['street']

    print(street)

    city = data['city']
    state = data['state']
    zip = data['zip']

    chlorine = data['chlorine']
    if chlorine != '':
        chlorine = float(chlorine)

    turbidity = data['turbidity']
    if turbidity != '':
        turbidity = float(turbidity)

    fluorine = data['fluorine']
    if fluorine != '':
        fluorine = float(fluorine)

    coliform = data['coliform']
    if coliform != '':
        coliform = float('coliform')

    ecoli = data['ecoli']
    if ecoli != '':
        ecoli = float(ecoli)

    location = street + ', ' + city + ', ' + state + ' ' + zip + ', USA'  

    print(location)

    lat, lon = geocode_address(location)

    datum = date.today()

    # db.insert_water_data(datum, chlorine, turbidity, fluorine, coliform, ecoli, lat, lon, location)

    date_str = datum.isoformat()

    # Parse the date string into a datetime object
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")

    # Format the date object into the desired format
    new_date_str = date_obj.strftime("%m/%d/%Y")

    values_to_append = [[new_date_str, chlorine, turbidity, fluorine, coliform, ecoli, lat, lon, location]]

    # now insert into sheets
    create_service(values_to_append)

    return {
        "success": True
    }

def create_service(values_to_append):
    # Path to your service account key file
    base_dir = constants.MEDIA_ROOT     
    SERVICE_ACCOUNT_FILE = os.path.join(base_dir, str('creds.json')) # construct absolute path

    # Define the scopes
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

    # Authenticate and construct service
    credentials = Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)

    service = build('sheets', 'v4', credentials=credentials)

    # Example: Reading from a spreadsheet
    spreadsheet_id = '1yzDftjjU1xpEdLXdgNZR7fK5gvIotPVYu40RSVr1Y4k'
    range_name = 'Sheet1!A:I'  # Adjust the range accordingly

    body = {'values': values_to_append}

    # Append the values to the next available row
    result = service.spreadsheets().values().append(
        spreadsheetId=spreadsheet_id,
        range=range_name,
        valueInputOption='USER_ENTERED',
        body=body,
        # valueInputOption='RAW'  # Use 'RAW' for unformatted values, use 'USER_ENTERED' for formatted values
    ).execute()

    '''
    # PULL THE ROWS AND SEE
    range_name = 'Sheet1!A1:D5'  # Adjust the range accordingly
    result = service.spreadsheets().values().get(
        spreadsheetId=spreadsheet_id, range=range_name).execute()
    rows = result.get('values', [])

    if not rows:
        print('No data found.')
    else:
        for row in rows:
            # Print columns A and B, which correspond to indices 0 and 1.
            print(f"{row[0]}, {row[1]}")
    '''
