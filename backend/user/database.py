'''
ACTIONS CONCERNING THE MYSQL DATABASE
(e.g. connecting to it, making queries)
'''

from sshtunnel import SSHTunnelForwarder 
import sqlalchemy
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text
import awswrangler 
import os
from dotenv import load_dotenv, find_dotenv
import paramiko
import pandas as pd
import json

load_dotenv(find_dotenv())

# Doing it the awswrangler/sqlalchemy way 

# engine = None # use this to make SQL queries later

# backend directory location (MAY NEED LATER)
# current_dir_path = os.path.dirname(os.path.abspath(__file__))
# pem_key_path = os.path.join(current_dir_path, "mysql.pem") # not exactly sure how this is working?
# print(pem_key_path)

AWS_IP = os.getenv('AWS_IP')
DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')
SSH_PRIVATE_KEY_PASSWORD = os.getenv('SSH_PRIVATE_KEY_PASSWORD')

''' FOR DEBUGGING ONLY '''
# print(AWS_IP)
# print(DATABASE_PASSWORD)

# REMOTE_BIND_ADDRESS = 'ec2-18-220-201-181.us-east-2.compute.amazonaws.com'

# ssh tunnel closes at the end of the method (so we need to reconnect each time we make a query...)
# example query: "select * from USERS"

'''
For logging in a user or checking if they exist
'''
def user_exists(username, password=""):

    '''
    if no password specified, then just checking by username
    '''

    # global engine # to indicate we want to change the global var and not make a local copy with same name

    with SSHTunnelForwarder( 
        # NEED TO REPLACE EACH TIME WITH THE NEW IP OF DATABASE (in ENV file) #

        (AWS_IP, 22), # 22 by default
        ssh_username='ec2-user', 
        # ssh_pkey=pem_key_path, # not sure if absolute is necessary
        # I think it uses the pem key in the .ssh folder by default so this doesn't matter
        # ssh_private_key_password=SSH_PRIVATE_KEY_PASSWORD,
        remote_bind_address=('127.0.0.1', 3306) # port 3306 is default for mySQL

    ) as server: 
        try: 
            print("****SSH Tunnel Established****")   

            # server.start() # start ssh server

            conf ={
                'host': '127.0.0.1', # local because 
                'port': str(server.local_bind_port), # '3306',
                'database': "SECRA", # might need to change this
                'user': "root",
                'password': DATABASE_PASSWORD
            }

            # might need this instead
            # local_port = str(server.local_bind_port)

            engine = create_engine("mysql+pymysql://{user}:{password}@{host}:{port}/{database}".format(**conf))
            # engine.dispose() 

            with engine.connect() as connection:
                
                query = None
                result = None
                params = None

                if password == "": # just checking if the username exists
                    query = """
                    SELECT * FROM USERS
                    WHERE username = :username
                    """

                    params = {"username": username} # must be a dict

                    result = connection.execute(text(query), params)
                else: # checking both username and password
                    query = """
                    SELECT * FROM USERS
                    WHERE username = :username AND password = :password
                    """

                    params = {"username": username, "password": password} # must be a dict
                    
                    result = connection.execute(text(query), params)
                
                df = pd.DataFrame(result.fetchall(), columns=result.keys())

                # rows = connection.execute(text(query)) # need to wrap string in text
                # print(rows)

                if not df.empty: # user exists
                    return True
                else:
                    return False

                # return rows
            
                for row in rows:
                    print(row)

        except Exception as e:
            print("ERROR: " + str(e))

# make_query("SELECT * FROM USERS")

'''
Create a new user in the database
'''
def create_user(username, password):
    # global engine # to indicate we want to change the global var and not make a local copy with same name

    with SSHTunnelForwarder( 
        # NEED TO REPLACE EACH TIME WITH THE NEW IP OF DATABASE (in ENV file) #

        (AWS_IP, 22), # 22 by default
        ssh_username='ec2-user', 
        # ssh_pkey=pem_key_path, # not sure if absolute is necessary
        # I think it uses the pem key in the .ssh folder by default so this doesn't matter
        # ssh_private_key_password=SSH_PRIVATE_KEY_PASSWORD,
        remote_bind_address=('127.0.0.1', 3306) # port 3306 is default for mySQL

    ) as server: 
        try: 
            print("****SSH Tunnel Established****")   

            # server.start() # start ssh server

            conf ={
                'host': '127.0.0.1', # local because 
                'port': str(server.local_bind_port), # '3306',
                'database': "SECRA", # might need to change this
                'user': "root",
                'password': DATABASE_PASSWORD
            }

            # might need this instead
            # local_port = str(server.local_bind_port)

            engine = create_engine("mysql+pymysql://{user}:{password}@{host}:{port}/{database}".format(**conf))
            # engine.dispose() 

            with engine.connect() as connection:
                
                query = None

                # change this later
                first_name = username
                last_name = username
                email = username

                # DO NOT USE F STRING REPLACEMENT, WEAK TO SQL INJECTION ATTACKS
                query = """
                INSERT INTO USERS (FIRST_NAME, LAST_NAME, EMAIL, USERNAME, PASSWORD)
                VALUES (:first_name,:last_name,:email,:username,:password);
                """

                params = {"first_name": first_name, 
                          "last_name": last_name, 
                          "email": email, 
                          "username": username,
                          "password": password} # must be a dict

                connection.execute(text(query), params)
                connection.commit()

        except Exception as e:
            print("ERROR: " + str(e))

'''
To obtain the USER ID, given username
Assumed that we've logged in already
'''
def get_user_id(username):
    with SSHTunnelForwarder( 
        (AWS_IP, 22), # 22 by default
        ssh_username='ec2-user', 
        remote_bind_address=('127.0.0.1', 3306) # port 3306 is default for mySQL
    ) as server: 
        try: 
            print("****SSH Tunnel Established****")   

            # server.start() # start ssh server

            conf ={
                'host': '127.0.0.1', # local because 
                'port': str(server.local_bind_port), # '3306',
                'database': "SECRA", # might need to change this
                'user': "root",
                'password': DATABASE_PASSWORD
            }

            # might need this instead
            # local_port = str(server.local_bind_port)

            engine = create_engine("mysql+pymysql://{user}:{password}@{host}:{port}/{database}".format(**conf))
            # engine.dispose() 

            with engine.connect() as connection:
                query = '''
                SELECT USER_ID FROM USERS 
                WHERE USERNAME = :username;
                '''

                params = {"username": username} # must be a dict
                result = connection.execute(text(query), params)
                
                df = pd.DataFrame(result.fetchall(), columns=result.keys())

                if len(df) == 1:
                    user_id = df.iloc[0, 0]
                    return user_id
                else:
                    return None

        except Exception as e:
            print("ERROR: " + str(e))

'''
Insert a conversation message into the database
'''
def insert_message(user_id, message, role):
    with SSHTunnelForwarder( 
        (AWS_IP, 22), # 22 by default
        ssh_username='ec2-user', 
        remote_bind_address=('127.0.0.1', 3306) # port 3306 is default for mySQL

    ) as server: 
        try: 
            print("****SSH Tunnel Established****")   

            conf ={
                'host': '127.0.0.1', # local because 
                'port': str(server.local_bind_port), # '3306',
                'database': "SECRA", # might need to change this
                'user': "root",
                'password': DATABASE_PASSWORD
            }

            engine = create_engine("mysql+pymysql://{user}:{password}@{host}:{port}/{database}".format(**conf))

            with engine.connect() as connection:
                query = """
                INSERT INTO MESSAGES (USER_ID, MESSAGE, ROLE)
                VALUES (:user_id,:message,:role);
                """

                params = {"user_id": user_id, 
                          "message": message,
                          "role": role} # must be a dict

                connection.execute(text(query), params)
                connection.commit()

        except Exception as e:
            print("ERROR: " + str(e))

'''
Obtain every conversation record associated with user_id
'''
def get_messages(user_id):
    with SSHTunnelForwarder( 
        (AWS_IP, 22), # 22 by default
        ssh_username='ec2-user', 
        remote_bind_address=('127.0.0.1', 3306) # port 3306 is default for mySQL

    ) as server: 
        try: 
            print("****SSH Tunnel Established****")   

            conf ={
                'host': '127.0.0.1', # local because 
                'port': str(server.local_bind_port), # '3306',
                'database': "SECRA", # might need to change this
                'user': "root",
                'password': DATABASE_PASSWORD
            }

            engine = create_engine("mysql+pymysql://{user}:{password}@{host}:{port}/{database}".format(**conf))

            with engine.connect() as connection:
                query = '''
                SELECT MESSAGES.MESSAGE_ID, MESSAGES.MESSAGE, MESSAGES.ROLE, MESSAGES.TIMESTAMP
                FROM MESSAGES
                WHERE MESSAGES.USER_ID = :user_id
                ORDER BY MESSAGES.TIMESTAMP ASC;
                '''

                # OLDEST MESSAGES FIRST

                params = {"user_id": user_id} # must be a dict

                result = connection.execute(text(query), params)
                connection.commit()

                df = pd.DataFrame(result.fetchall(), columns=result.keys())

                return df

        except Exception as e:
            print("ERROR: " + str(e))

'''
Retrieve token for gcal API
'''
def get_gcal_token(user_id):
    with SSHTunnelForwarder( 
        (AWS_IP, 22), # 22 by default
        ssh_username='ec2-user', 
        remote_bind_address=('127.0.0.1', 3306) # port 3306 is default for mySQL
    ) as server: 
        try: 
            print("****SSH Tunnel Established****")   

            # server.start() # start ssh server

            conf = {
                'host': '127.0.0.1', # local because 
                'port': str(server.local_bind_port), # '3306',
                'database': "SECRA", # might need to change this
                'user': "root",
                'password': DATABASE_PASSWORD
            }

            # might need this instead
            # local_port = str(server.local_bind_port)

            engine = create_engine("mysql+pymysql://{user}:{password}@{host}:{port}/{database}".format(**conf))
            # engine.dispose() 

            with engine.connect() as connection:
                query = '''
                SELECT GCAL FROM API_TOKENS 
                WHERE USER_ID = :user_id;
                '''

                params = {"user_id": user_id} # must be a dict
                result = connection.execute(text(query), params)
                
                df = pd.DataFrame(result.fetchall(), columns=result.keys())

                if len(df) == 1:
                    gcal_token = df.iloc[0, 0]
                    json_token = json.loads(gcal_token) 
                    # it's a double encoded, so need to now convert to dict
                    json_token = json.loads(json_token)

                    print(type(json_token))
                    print(json_token)

                    return json_token
                else:
                    return None

        except Exception as e:
            print("ERROR: " + str(e))


'''
Insert a token into the database, tied to user_id
'''
def insert_gcal_token(user_id, token):
    with SSHTunnelForwarder( 
        (AWS_IP, 22), # 22 by default
        ssh_username='ec2-user', 
        remote_bind_address=('127.0.0.1', 3306) # port 3306 is default for mySQL

    ) as server: 
        try: 
            print("****SSH Tunnel Established****")   

            conf ={
                'host': '127.0.0.1', # local because 
                'port': str(server.local_bind_port), # '3306',
                'database': "SECRA", # might need to change this
                'user': "root",
                'password': DATABASE_PASSWORD
            }

            engine = create_engine("mysql+pymysql://{user}:{password}@{host}:{port}/{database}".format(**conf))

            with engine.connect() as connection:
                query = """
                INSERT INTO API_TOKENS (USER_ID, GCAL)
                VALUES (:user_id,:token)
                ON DUPLICATE KEY UPDATE GCAL = :token;
                """

                params = {"user_id": user_id, 
                          "token": token}

                connection.execute(text(query), params)
                connection.commit()

        except Exception as e:
            print("ERROR: " + str(e))