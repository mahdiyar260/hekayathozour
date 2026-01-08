from django.db import models

class Phone(models.Model):
    phone_number = models.CharField(max_length = 10)

    def __str__(self):
        return self.phone_number

class Reserv(models.Model):

    leader_name = models.CharField(max_length = 50)
    day = models.CharField(max_length = 20)
    reservation_code = models.CharField(max_length = 4, unique = True)
    phone_number = models.CharField(max_length = 11, unique = True)
    men = models.PositiveIntegerField()
    women = models.PositiveIntegerField()

    def __str__(self):
        return f"leader_name: {self.leader_name} | code: {self.reservation_code}"

class Days(models.Model):
    order = models.PositiveIntegerField(default = 0)
    day = models.CharField(max_length = 20)
    status = models.CharField(max_length = 10, default = 'able')


# Create your models here.
