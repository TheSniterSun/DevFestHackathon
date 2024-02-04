import json
from flask import Flask, request, jsonify
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager
from dotenv import load_dotenv, find_dotenv

from datetime import datetime
from datetime import date

from openai import OpenAI
import openai

import traceback
import requests

# HOW TO IMPORT FILES FROM PARENT DIRECTORY
import sys
import os

from flask import Response


parent_dir = os.path.abspath('..')
sys.path.append(parent_dir)

import constants
from user import database as db
from flask_cors import CORS




load_dotenv(find_dotenv())

app = Flask(__name__)

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1) # set the expiration time for access token
jwt = JWTManager(app)

# CORS(app) # enable CORS (cross origin resource sharing) for all routes
# basically this server includes the "Access-Control-Allow-Origin" header in its responses to the client

# allow requests from only certain domains
# in this case, localhost:3000 only
CORS(app)
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

'''
Basically before the request is made, we need to return a header
For CORS
'''
@app.before_request
def basic_authentication():
    if request.method.lower() == 'options':
        return Response()

load_dotenv()

timezones = constants.TIMEZONES # access timezone constants

'''
This should only be called once
To indicate the first message in conversation history
(Every time we retrieve the conversation records)
'''
def define_instructions():
    # BEGIN SYSTEM PROMPT HERE

    response_template = {
        'solutions': [
            {'summary': 'Report',
             'content': 'Immediately report the water pollution incident to your local environmental protection agency or health department.'
            },

            {'summary': 'Bottled Water',
             'content': 'Switch to using bottled water for drinking, cooking, bathing, and other household uses until the water quality is deemed safe.'
            },
        ]
    }

    response_template = json.dumps(response_template)
        
    instructions = f'''The user will ask you for help, regarding water quality concerns.

    For instance, they may say that there is water pollution in the neighborhood.
    In this case, first search the web and find the best solutions for their specific problem.
    
    Then return a list of solutions, following this JSON format: {response_template}
    '''

    return instructions

'''
SUBMIT A NEW QUERY TO GPT
'''
@app.route('/submit', methods=["POST"])
@jwt_required() # require JWT auth
def submit(): # when user submits a scheduling request (from chat page)

    username = request.json.get("username", None)
    query = request.json.get("query", None)

    # body = json.loads(request.body.decode('utf-8')) # use loads() to load from string not file
    # body = json.loads(request.body.decode('utf-8')) # use loads() to load from string not file
    # print(body)
    # username = body['username']

    # -- Step 1: Retrieve USER_ID

    USER_ID = db.get_user_id(username)
    print("----- SUCCESS! ACQUIRED USER ID ---- ")
    print(USER_ID)

    # Now, user query only includes event info
    # We obtain the busy times from their calendar using Google Calendar API
    # endpoint: "add/get_busy_times"

    # STORING CONVERSATION RECORDS

    print("USER ID: " + str(USER_ID))

    # -- Step 2: Insert the message, tied to user
    db.insert_message(USER_ID, query, 'user')

    # FIRST SEE WHETHER THIS IS THE USER'S FIRST TIME CHATTING WITH THE BOT
    # Get every conversation record associated with the user
    conversations_df = db.get_messages(USER_ID) # pandas df

    print("---- CONVERSATION ---- ")
    print(conversations_df)

    num_convos = len(conversations_df)

    messages = [] # list of messages for gpt
                    # in messages, we want the first item to be the system response

    # before adding any messages, set the instructions
    instructions = define_instructions()
    messages.append({'role': 'system', 'content': instructions})
    
    # custom timestamp field (oldest convos are returned first)

    print("--- START OF CONVERSATION TESTING --- ")
    print("Number of stored convos: " + str(num_convos)) # excludes the system prompt
    num = 1

    print("ITERATING OVER CONVOS")

    conversations_df = conversations_df.reset_index()  # make sure indexes pair with number of rows

    for idx, row in conversations_df.iterrows(): # replace w better method later
        # print(row)

        role = row['ROLE']
        role = str(role)

        message = row['MESSAGE']
        message = str(message)

        print("Convo " + str(num) + " by " + role + ": " + message[0:10]) # only take first few letters of each conversation
        num += 1

        message = {'role': role, 'content': message} # should alternate between user and assistant
        messages.append(message)

    # finally, add the user's query
    # messages.append({'role': 'user', 'content': query}) # most recent prompt/message by user

    print("--- END OF CONVERSATION TESTING --- ")
    
    # it takes a while here for some reason

    # generate new response from gpt
    print("starting to generate message")
    new_messages = generate(messages) # THIS GENERATING PART TAKES A WHILE
    print("done with generate message")
    response = new_messages[-1]['content'].strip() # take the last (most recent) message

    # -- Step 3: Insert the gpt message, tied to user
    print("starting to insert message")
    db.insert_message(USER_ID, response, 'assistant')
    print("end of inserting message")

    return {
        'success': True,
        'response': response
    }

'''
STANDARD METHOD OF GENERATING A REPONSE USING GPT
'''
def generate_old(messages): # pass in conversation list (i.e. store conversation records)
    # the conversation is a list of dictionaries (which has the role and message content)
    
    response = openai.ChatCompletion.create( # uses the chat completions API to create model and return response
        # response is an openAI object (looks like JSON)
        model=None,
        messages=messages # pass in messages as input
    )

    messages.append({'role': response.choices[0].message.role, 'content': response.choices[0].message.content})
    return messages

def generate_old_2(messages):

    # OPEN AI SETUP - NEW
    api_key = os.getenv('OPENAI_API_KEY')
    # openai.api_key = api_key

    client = OpenAI(
        api_key=api_key
    )

    model = 'gpt-4' # UPGRADING TO GPT 4, can use the turbo version later on
    # model = 'gpt-3.5-turbo' # can try with gpt 4 later

    print("----MESSAGES----")
    print(messages)

    response = client.chat.completions.create(
        model=model,
        messages=messages
    )   

    messages.append({'role': response.choices[0].message.role, 'content': response.choices[0].message.content})
    return messages

'''
New method using gpt-4 turbo and JSON mode
'''
def generate(MESSAGES):
    # OPEN AI SETUP - NEW
    api_key = os.getenv('OPENAI_API_KEY')
    # openai.api_key = api_key

    client = OpenAI(
        api_key=api_key
    )

    MODEL = 'gpt-3.5-turbo-1106'
    # MODEL = 'gpt-4-1106-preview'
    # MODEL = 'gpt-4-turbo-preview' # UPGRADING TO GPT 4, can use the turbo version later on
    # MODEL = 'gpt-4' # UPGRADING TO GPT 4, can use the turbo version later on
    # model = 'gpt-3.5-turbo' # can try with gpt 4 later

    response = client.chat.completions.create(
        model=MODEL,
        response_format={ "type": "json_object" },
        messages=MESSAGES
    )

    MESSAGES.append({'role': response.choices[0].message.role, 'content': response.choices[0].message.content})
    return MESSAGES