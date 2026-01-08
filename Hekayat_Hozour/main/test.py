from kavenegar import *

try:
    api = KavenegarAPI('5539483449446E706977336846657A477A455A445276415A684371516B3877716F6A6E356A2F4C6A4F68413D')
    params = {
        'sender': "2000660110",
        'receptor': "09016150102",
        'message': "Hi!\nThis is a test message from me!"
    }
    response = api.sms_send(params)
    print(response)
except APIException as e:
    print(e)
except HTTPException as e:
    print(e)
