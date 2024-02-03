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
# CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

'''
Basically before the request is made, we need to return a header
For CORS

@app.before_request
def basic_authentication():
    if request.method.lower() == 'options':
        return Response()
'''

load_dotenv()

timezones = constants.TIMEZONES # access timezone constants

'''
This should only be called once
To indicate the first message in conversation history
(Every time we retrieve the conversation records)
'''
def define_instructions():
    # get timezone from the google calendar API later
    # for now, just use Eastern Time by default
    timezone = "US/Eastern"

    time_template = {
        'start': 'insert the event start time here',
        'end': 'insert the event end time here',
        'date': 'insert the event date in YYYY/MM/DD format here'
    }

    time_template = json.dumps(time_template)

    times_template = {
        'times': [
            {
                'start': '11:45 AM',
                'end': '12:00 PM',
                'date': '2023/08/09'
            },
            {
                'start': '01:15 PM',
                'end': '01:30 PM',
                'date': '2023/08/09'
            },
            {
                'start': '01:45 PM',
                'end': '02:00 PM',
                'date': '2023/08/09'
            },
        ]
    }

    times_template = json.dumps(times_template)

    # BEGIN SYSTEM PROMPT HERE
    instructions = f'''Here are instructions on how to format your response for each user query.
    The user will ask you to suggest times for an event and indicate times when they're busy. 
    Here's an example of a user query:

    Suggest 3 time(s) for a 15 minute lunch with Jenny this week. We're meeting at Soup Dumpling Plus.
    Do not include suggestions that overlap with these times: 01:00 PM to 01:30 PM on 2023/08/13, 11:00 AM to 12:30 PM on 2023/08/14

    Important: you should respond with nothing besides a JSON, which contains potential times and relevant event details. 
    Specifically, first create a list of suggested event times. 
    For each suggested time, use a JSON formatted text that follows this template: {time_template}. 
    Then create a new JSON formatted text, which will be your full response to my query. I will refer to this as the main JSON.

    Inside the main JSON, make a new key called "times" and make its value the list of suggested times you created.
    Here's an example: {times_template}
    '''

    # RECURRING EVENTS FORMATTING
    frequency_template = {
        'frequency': 'choose one of these values: daily, weekly, monthly',
        'end-date': 'choose one of these values: a date in YYYY/MM/DD format or \'none\''
    }

    frequency_template = json.dumps(frequency_template)

    recurring_time_template = {
        'times': [
            {
                'start': '3:30 PM',
                'end': '6:30 PM',
                'date': '2023/08/19'
            },
            {
                'start': '08:15 PM',
                'end': '11:15 PM',
                'date': '2023/08/19'
            },
            {
                'start': '04:45 PM',
                'end': '07:45 PM',
                'date': '2023/08/19'
            },
        ]
    }

    recurring_time_template = json.dumps(recurring_time_template)

    instructions += f'''In the main JSON, make a new key called “recurrence” and make its value the event recurrence.
    Specifically, the value should be a JSON formatted text following this template:
    {frequency_template}. Here are some examples indicating recurrence:

    If I say "repeat each day until the 20th", then the recurrence value should be "daily, 2023/08/20".
    If I say "each month until next year" then the recurrence value should be "monthly, 2023/12/31".
    If I say "every week until October" then the recurrence value should be "weekly, 2023/09/30".
    If I say "once a week" then the recurrence value should be "weekly, none".

    Note: Words that often indicate recurrence include "each" and "every".
    
    Furthermore, if recurrence is specified, then you may need to edit the list of suggested times, which is the value of 
    the "times" key in the main JSON. Specifically, in the JSON representing each suggested time, make sure that 
    the value of "date" is the same for each suggestion. 
    
    For instance, if I said "schedule a weekly event starting on 2023/08/19", then the
    value of the "times" key in the main JSON should resemble this: {recurring_time_template}.

    However, if no recurrence was specified in my query, then just make the recurrence value an empty string.
    '''

    # ADDITIONAL EVENT PARAMS: SUMMARY, LOCATION, TIMEZONE
    instructions += f'''Also make two other key value pairs in the main JSON.
    First, make a key called "summary" and makes its value a summary of the event. Here are some examples:
    
    If I said something like "meeting with Jenny on Thursday for boba" then the summary value should be "Boba with Jenny".
    If I said something like "meet up with Tyler to review notes" then the summary value should be "Note review with Tyler".
    If I said something like "event for new freshman" then the summary value should be "New freshman event".
    If I said something like "talk with Alex on Thursday" then the summary value should be "Talk with Alex".
    If I said something like "meeting with Samuel" then the summary value should be "Meeting with Samuel".

    If not specified, then just make the summary value "New event".
    
    Second, make a key called "location" and make its value the location of the event.
    But if you can't infer the location, then just make the value an empty string.

    Third, make a key called "timezone" and make its value "{timezone}".
    '''

    # OTHER PARAMS (TO ADD LATER): Description, Attendee List
    other_params = '''Second, make a key called “description” and set the value equal to a description of my event. 
    If not specified, then just set the description equal to an empty string.
    
    Fifth, make a key called "attendees" and set the value equal to a list of attendees I specified. 
    For the format of the value, refer to the Google Calendar API. 
    For instance, if I said "invite Brandon Pae, brandonpaegaming@gmail.com", then the attendees value should be 
    '[{'displayName': 'Brandon Pae', 'email': 'brandonpaegaming@gmail.com'}]'
    If not specified, then just set the attendees equal to an empty list.
    '''

    # once we have the instructions, store it as the first conversation record
    # USER = User.objects.get(username=username) # need to update this locally

    # Create a new conversation instance in database tied to user
    # conversation = Conversation.objects.create(user=USER, message=instructions, role='system')

    # Note: to access a specific field/column, it's just instance.field
    # For example, conversation.user

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

    response_body = ""

    # response=requests.get("http://www.example.com/", headers={"Content-Type":"text"})

    try:
        PARAMS = {'user_id': USER_ID}

        response = ""

        try:
            response = requests.get(url = 'http://127.0.0.1:5000/gcal/get_busy_times', params=PARAMS, timeout=100)
        except requests.exceptions.Timeout:
            print("The request timed out")
            # handle timeout exception
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")

        # from now on, ALWAYS USE IP instead of localhost
        
        # by default, it uses port 80 so SPECIFY PORT
        
        print("---- CHECKPOINT 1 ---- ")
        # Check if the request was successful
        if response.status_code == 200:
            print("REQUEST TO GCAL SUCCESSFUL")
            # Process the response content, if needed
            response_body = response.text
            response_body = json.loads(response_body) # use loads() to load from JSON string
        else:
            print("---- CHECKPOINT 2 ---- ")
            print("ISSUE WITH ADD/GET_TIMES ENDPOINT: " + str(response.status_code))
            print(response)
    except:
        # throws an error here

        print("---- CHECKPOINT 3 ---- ")
        traceback.print_exc()

    print("----- SUCCESS! GOT THE BUSY TIMES ---- ") # STUCK HERE I WILL KILL MYSELF

    print(type(response_body))
    print(response_body) # empty response body

    busy_times = response_body["busy_times"]

    # now we just need to tell GPT the user query
    
    busy_times_string = f''' Do not include suggestions that overlap with these times: {busy_times}.'''

    query += busy_times_string

    # get current date to make sure it schedules events in the correct week
    today = date.today()
    query += " Note that today is " + str(today) + ". "

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
    
    # generate new response from gpt
    new_messages = generate(messages)
    response = new_messages[-1]['content'].strip() # take the last (most recent) message

    # -- Step 3: Insert the gpt message, tied to user
    db.insert_message(USER_ID, response, 'assistant')

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

    MODEL = 'gpt-4-turbo-preview' # UPGRADING TO GPT 4, can use the turbo version later on
    # model = 'gpt-3.5-turbo' # can try with gpt 4 later

    response = client.chat.completions.create(
        model=MODEL,
        response_format={ "type": "json_object" },
        messages=MESSAGES
    )

    MESSAGES.append({'role': response.choices[0].message.role, 'content': response.choices[0].message.content})
    return MESSAGES