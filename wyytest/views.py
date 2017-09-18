# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, HttpResponse
from django.views.decorators.csrf import csrf_exempt

from wyytest.models import User

users = [
        {'user': 'zhangsan', 'pwd': 'aaa'},
        {'user': 'lisi', 'pwd': 'bbb'}
    ]


def login(request):
    return render(request, "wyytest/index.html")

@csrf_exempt
def index(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        print('username:%s password:%s' % (username, password))

        User.objects.create(user=username, pwd=password)

    return render(request, "wyytest/users.html", {'users': User.objects.all()})


def detail(request, question_id):
    return HttpResponse("You're looking at question %s." % question_id)


def results(request, question_id):
    response = "You're looking at the results of question %s."
    return HttpResponse(response % question_id)


def vote(request, question_id):
    return HttpResponse("You're voting on question %s." % question_id)
