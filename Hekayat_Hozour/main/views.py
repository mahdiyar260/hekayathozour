from django.shortcuts import render
from django.http import JsonResponse
from .models import Reserv, Days
from django.db.models import Sum, F, IntegerField
import json
import random
from kavenegar import *

def index(request):
    days = Days.objects.all().order_by('order')
    return render(request, 'index.html', {'days': days})

def send_code(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        phone_number = data.get('phone')
        if phone_number:
            verification_code = random.randint(1000, 9999)
            request.session['verification_code'] = str(verification_code)
            request.session['phone_number'] = phone_number
            """try:
                api = KavenegarAPI('5539483449446E706977336846657A477A455A445276415A684371516B3877716F6A6E356A2F4C6A4F68413D')
                params = {
                    'sender': "2000660110",
                    'receptor': "09016150102",
                    'message': f"کد تایید: {request.session.get('verification_code')}"
                }
                response = api.sms_send(params)
                print(response)
            except APIException as e:
                print(e)
            except HTTPException as e:
                print(e)"""
            return JsonResponse({'code': verification_code})
        return JsonResponse({'error': 'Invalid request'}, status = 400)
    return JsonResponse({'error': 'Invalid request'}, status=400)

def verify_code(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        code = data.get('code')
        if code == request.session.get('verification_code'):
            return JsonResponse({'success': True})
        return JsonResponse({'success': False})
    return JsonResponse({'error': 'Invalid request'}, status=400)

def check_phone(request):
    if request.method == "POST":
        phone = request.session.get('phone_number')
        return JsonResponse({'exist': Reserv.objects.filter(phone_number = phone).exists()})
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400 )

def get_days_status(request):
    if request.method == "GET":
        days = Days.objects.all()
        data = {}
        for day in days:
            total = Reserv.objects.filter(day = day.day).aggregate(
                t = Sum(F('men') + F('women'), output_field=IntegerField())
            )['t'] or 0
            if day.status == 'able':
                if total > 10:
                    day.status = 'complited'
                    day.save()
            data[day.day] = {
                'status': day.status
            }
        return JsonResponse(data)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400 )

def give_day(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        day = data.get('day')
        request.session['day'] = day
        return JsonResponse({'status': 'ok'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

def save_reserv(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        leader_name = data.get('leader_name')
        day = request.session.get('day')
        phone_number = request.session.get('phone_number')
        men = int(data.get('men'))
        women = int(data.get('women'))

        minimom = Days.objects.get(day=day).order * 1000
        maximom = minimom + 999

        c = True
        while c:
            reservation_code = random.randint(minimom, maximom)
            if Reserv.objects.filter(reservation_code=reservation_code).exists():
                continue
            c = False

        reserv = Reserv(
            leader_name = leader_name,
            day = day,
            reservation_code = str(reservation_code),
            phone_number = phone_number,
            men = men,
            women = women
        )

        """try:
            api = KavenegarAPI('5539483449446E706977336846657A477A455A445276415A684371516B3877716F6A6E356A2F4C6A4F68413D')
            params = {
                'sender': "2000660110",
                'receptor': "09016150102",
                'message': f"رزرو شما با موفقیت انجام شد.\nکد رزرو: {reservation_code}"
            }
            response = api.sms_send(params)
            print(response)
        except APIException as e:
            print(e)
        except HTTPException as e:
            print(e)"""

        reserv.save()

        return JsonResponse({'reservation_code': reservation_code})

    return JsonResponse({'error': 'Invalid request'}, status=400)

def skip(request):
    if request.method == 'POST':
        phone = request.session.get('phone_number')
        return JsonResponse({'reservation_code': Reserv.objects.get(phone_number = phone).reservation_code})
    else:
        return JsonResponse({ 'error': 'Invalid request' }, status=400)


# Create your views here.
