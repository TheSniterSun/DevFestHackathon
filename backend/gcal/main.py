from __future__ import print_function

from datetime import datetime
from dotenv import load_dotenv, find_dotenv
import os
import openai
import json
import traceback
import re

import os.path
import sys

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager

import base64

from flask import Flask, request, jsonify

import constants
from user import database as db
from flask_cors import CORS


load_dotenv(find_dotenv())
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": ["http://localhost:5000", "http://localhost:3000"]}}) # same port number

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar']
CALENDAR_ID = 'primary' # just set as primary (default) calendar for now

'''
This is called by GPT route, NOT the user client
To add a new event 
'''

@app.route('/submit', methods=["POST"])
def submit(): # when user submits a request to add event to calendar
    # print(request.method)

    print("add/submit endpoint triggered")
    print(request.method)

    try:
        if request.method == "POST":
            print("success")
            print(request.data)

            input_str = json.loads(request.data.decode('utf-8')) # use loads() to load from string, not file
            username = input_str['username']
            input_str = input_str['event']

            print(input_str)

            summary = input_str['summary']
            location = input_str['location']
            start = input_str['start']
            end = input_str['end']
            timezone = input_str['timezone']
            date = input_str['date']
            recurrence = input_str['recurrence'] # dict with two fields: frequency, end-date

            event = {}
            
            # calendar API uses 24 hour clock (so shouldn't specify AM/PM)
            # since our input is 12 hour clock (AM/PM) we need to convert

            dt_start_obj = datetime.strptime(start,'%I:%M %p') # input is 1:35 PM
            start_time = datetime.strftime(dt_start_obj, "%H:%M:%S") # output is 13:35:00

            dt_end_obj = datetime.strptime(end,'%I:%M %p')
            end_time = datetime.strftime(dt_end_obj, "%H:%M:%S")
            
            # right now in YYYY/MM/DD format, use YYYY-MM-DD format instead
            date = date.replace('/', '-')
            dateTimeStart = date + 'T' + start_time
            dateTimeEnd = date + 'T' + end_time

            event['summary'] = summary
            event['location'] = location
            event['start'] = {
                'dateTime': dateTimeStart,
                'timeZone': timezone
            }
            event['end'] = {
                'dateTime': dateTimeEnd,
                'timeZone': timezone
            }
            event['recurrence'] = []

            recurrence_conversion = { # only 3 possibilities for now
                'daily': 'DAILY',
                'weekly': 'WEEKLY',
                'monthly': 'MONTHLY',
            }

            # RECURRENCE, following Gcal API
            # 'RRULE:FREQ=WEEKLY;UNTIL=20230820T170000Z'
            if (recurrence != ""): # there is some repetition for the event

                freq = recurrence['frequency']
                end_date = recurrence['end-date']

                recurrence_val = 'RRULE:FREQ=' + recurrence_conversion[freq]

                if (end_date != "none"): # there is some end date
                    # convert end_date to datetime format

                    end_date = end_date.replace('/', '') # right now in YYYY/MM/DD format so convert

                    end_datetime = end_date + 'T' + '235900Z' # end of day
                    recurrence_val += ';UNTIL=' + end_datetime

                event['recurrence'].append(recurrence_val) # need to wrap in list for some reason

            print("Event: " + str(event))

            add_event(event, username) # main method

            return {
                'success': True,
            }
        
        else:
            return {
                "success": False
            }
        
    except:
        # printing stack trace
        traceback.print_exc()

'''
Supplementary method for adding an event to user's calendar
From the web client/browser
'''
def add_event(event, username):
    '''Basic test of Google Calendar API'''
    '''Now passing in event, not event ID, as param'''
    
    # UPDATED CREATE SERVICE CODE WHICH REQUIRES USER ID
    user_id = db.get_user_id(username)
    user_id = int(user_id)

    # create service to interact with gcal API
    service = create_service(user_id)

    # get events in their gcal
    events = get_events(service)

    # if there are events, print them to console
    '''
    if events is not None:
        print_events(service, events)
    '''
    
    # Create a single event (following user input from gpt)
    
    # UNCOMMENT LATER
    single_event = create_single_event(service, event)

    # Create a recurring league event
    # recurring_event = create_recurring_event(service)

    # Delete first instance of league event
    # delete_single_event(service, recurring_event_id)

    # get the league event ID
    # this needs to be the parent recurring event

    '''
    league_event = ''
    for event in events:
        if ("League" in event['summary']):
            league_event = event
            break
    

    # Edit all instances of recurring league event
    edit_recurring_event(service, league_event)
    '''

def create_service(user_id):
    ''' Build the Google Calendar service (to use the API) '''
    
    creds = None
    port = 8000 # need to use a different port than the one used by client/server already to create local server
    # then it redirects to a new tab on localhost on that port

    base_dir = constants.MEDIA_ROOT     

    credentials_file = os.path.join(base_dir, str('credentials.json')) # construct absolute path

    # TOKEN - UNIQUE FOR EACH USER, STORE IN DATABASE ONCE CREATED
    token = db.get_gcal_token(user_id) # should return json

    if token is not None: # token exists
        print("TOKEN EXISTS, SUCCESS")
        # token = json(token) # this should be 
        # creds = Credentials.from_authorized_user_file(token, SCOPES)
        creds = Credentials.from_authorized_user_info(token, SCOPES) # different method because using token_data directly
    
    # If there are no (valid) token credentials available, let the user log in
    # Then store the creds in token.json
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token: # if there are credentials but they're expired
            creds.refresh(Request()) # make a request to refresh them
            print("Token exists but is expired! May need to delete token.json and re-authorize")
        else:
            flow = InstalledAppFlow.from_client_secrets_file( # authorization flow
                credentials_file, SCOPES) 
            creds = flow.run_local_server(port=port) # run a local server for authorization on port 8080
        
        # Save the credentials for the next run
        # store token as TEXT field in database
        token = creds.to_json()
        token_string = json.dumps(token)

        db.insert_gcal_token(user_id, token_string)

    try:
        service = build('calendar', 'v3', credentials=creds) # build gcal service object with creds
        # hits the following API endpoint: https://www.googleapis.com/calendar/v3
        return service
    
    except HttpError as error:
        print('An error occurred: %s' % error)
        sys.exit(0) # quit the program

'''
Obtain the busy times for GPT
'''
@app.route('/get_busy_times', methods=["GET"])
def get_busy_times(): # don't need to specify request as param for Flask
    # need a separate method because we can't just call get_events (requires service object)
    
    print(" -------- GCAL CHECKPOINT 1 -------- ")
    # pass in the username
    # could be sent in the GET request header
    user_id = request.args.get('user_id', default=None, type=str)
    user_id = int(user_id)
    
    print(" -------- GCAL CHECKPOINT 2 -------- ")

    # create service to interact with gcal API
    service = create_service(user_id)

    print(" -------- GCAL CHECKPOINT 3 -------- ")
    # get events in their gcal
    busy_times = get_events(service)

    return {
        'busy_times': busy_times
    }

# this will be called from gpt
# so that user does not have to pass in their events each time
def get_events(service):
    '''Get events in user's gcal'''
    # Call the Calendar API
    now = datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time, can use this later to indicate that we don't
    # want to schedule events for the past
    
    print('Getting the upcoming events...', end='\n\n')
    events_result = service.events().list(calendarId=CALENDAR_ID, 
                                          singleEvents=True,
                                          orderBy='startTime').execute() # acquire the events using the service
    # acquire each individual instance
    events = events_result.get('items', []) # get a list of the events

    busy_times = [] # returning this

    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        end = event['end'].get('dateTime', event['end'].get('date'))

        start_date, start_time = None, None
        
        if 'T' in start:  # Event has a time component
            start_date, start_time = start.split('T')

        end_date, end_time = None, None
        
        if 'T' in end:  # Event has a time component
            end_date, end_time = end.split('T')

        # Start time: 2023-08-13T00:00:00-04:00
        # End time: 2023-08-13T00:30:00-04:00
        
        start_date = start_date.replace('-', '/') # for consistency with gpt query
        end_date = end_date.replace('-', '/')

        start_time = start_time.split('-')[0] # remove timezone for query
        start_time = convert_to_12_hour_format(start_time) # gpt query examples use AM/PM

        end_time = end_time.split('-')[0]
        end_time = convert_to_12_hour_format(end_time)
        
        # for now, assuming that the start and end dates are the same (event doesn't span multiple days)
        # but can change this later
        busy_time = start_time + " to " + end_time + " on " + start_date
        busy_times.append(busy_time)

        print("Start to end time: " + busy_time)

    busy_times_string = ', '.join(busy_times) # combine the busy times into one line
    print("Busy times: " + busy_times_string)

    if not events: # no events in calendar
        print('No upcoming events found.', end='\n\n')
        return ""

    return busy_times_string

def convert_to_12_hour_format(time_24h):
    try:
        # Parse the input time using the 24-hour format
        time_obj = datetime.strptime(time_24h, '%H:%M:%S')
        
        # Convert the time to 12-hour format
        time_12h = time_obj.strftime('%I:%M %p')
        
        return time_12h
    except ValueError:
        return None


'''
FOR LATER: Currently not used
'''
def redirect_user(event_id):
    # to redirect user to event edit link (similar to how Zoom does it)
    # Either pass in event params or use the encoded event ID
    encoded_event_id = base64.urlsafe_b64encode(event_id.encode('utf-8')).decode('utf-8')

    # Construct the event edit link
    edit_link = f'https://calendar.google.com/calendar/r/eventedit/{encoded_event_id}'
    print('Event Edit Link:', edit_link)

'''
The rest of these methods are for later
'''
def print_events(service, events):
    # print start time + name of the events

    if not events: # if no events are found
        print('No events to print.', end='\n\n')
    else:
        recurring_num = 1
        single_num = 1

        for event in events:
            if 'recurrence' in event: # if recurring event, print each single event in it
                print("Recurring event " + str(recurring_num) + ": " + event['summary'])

                # get all instances of the recurring event
                instances = service.events().instances(calendarId=CALENDAR_ID, eventId=event['id']).execute()

                instance_num = 1

                for instance in instances['items']:
                    start = instance['start'].get('dateTime', instance['start'].get('date'))
                    summary = instance['summary']

                    print("Instance " + str(instance_num) + ": " + summary)
                    print("Start time: " + str(start))
                    print()

                    instance_num += 1

                recurring_num += 1
            
            else:
                start = event['start'].get('dateTime', event['start'].get('date'))
                summary = event['summary']

                print("Single event " + str(single_num) + ": " + summary)
                print("Start time: " + str(start))
                print()

def create_single_event(service, event):
    try:
        new_event = service.events().insert(calendarId=CALENDAR_ID, body=event).execute() # insert event into user's gcal
        new_event_id = str(new_event['id'])
        print("New event created. Event ID: " + new_event_id)

        return new_event
    except:
        # printing stack trace
        traceback.print_exc()
    
# USE THIS ONLY AS A TEMPLATE
def create_recurring_event(calendarService):
    event = {
        'summary': 'League of Legends',
        'location': 'Home',
        'start': {
            'dateTime': '2023-08-05T10:00:00-04:00',
            'timeZone': 'US/Eastern'
        },
        'end': {
            'dateTime': '2023-08-05T11:00:00-04:00',
            'timeZone': 'US/Eastern' # America/Los_Angeles for West coast time
        },
        'recurrence': [
            'RRULE:FREQ=MONTHLY;UNTIL=20231231T235900Z',
        ]
    }

    '''
    'recurrence': [
            'RRULE:FREQ=WEEKLY;UNTIL=20230820T170000Z', # Z just indicates UTC time
        ],
    '''

    recurring_event = calendarService.events().insert(calendarId=CALENDAR_ID, body=event).execute() # insert the new event
    recurring_event_id = str(recurring_event['id'])
    print("New recurring event created. Event ID: " + recurring_event_id)
    
    return recurring_event

def delete_single_event(service, recurring_event_id):
    ''' Delete first occurrence of recurring event'''
    # Get all the instances of a recurring event
    instances = service.events().instances(calendarId=CALENDAR_ID, eventId=recurring_event_id).execute()

    # Select the instance to cancel.
    instance = instances['items'][0] # only cancels the first occurrence
    instance['status'] = 'cancelled'

    # Update the event
    updated_instance = service.events().update(calendarId=CALENDAR_ID, eventId=instance['id'], body=instance).execute()

    # Print the updated date.
    # print(updated_instance['updated'])

    return updated_instance

def edit_recurring_event(service, event):
    ''' Edit the entire recurring event'''
    new_title = 'League (revised)'
    # new_start = '2023-08-12T10:00:00-04:00'
    # new_end = '2023-08-24T11:00:00-04:00'

    if 'recurrence' in event: # only if it's a recurring event

        # Get all instances of the recurring event
        instances = service.events().instances(calendarId=CALENDAR_ID, eventId=event['id']).execute()
        
        # Update each single instance with the new values
        for instance in instances['items']:
            instance['summary'] = new_title
            service.events().update(calendarId=CALENDAR_ID, eventId=instance['id'], body=instance).execute()
        print(f"Successfully updated all instances of the event: {event['summary']}")
    else:
        print("The provided event ID does not correspond to a recurring event.")


