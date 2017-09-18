# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models


class User(models.Model):
    user = models.CharField(max_length=32)
    pwd = models.CharField(max_length=32)
