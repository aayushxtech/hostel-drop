# Generated by Django 5.2.3 on 2025-06-13 22:19

import django.core.validators
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Student',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('clerk_id', models.CharField(max_length=128, unique=True)),
                ('full_name', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('phone', models.CharField(blank=True, max_length=10, validators=[django.core.validators.RegexValidator(message='Phone number must be 10 digits.', regex='^\\d{10}$')])),
                ('hostel_block', models.CharField(blank=True, max_length=30)),
                ('room_number', models.CharField(blank=True, max_length=10)),
                ('date_joined', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'ordering': ['full_name'],
                'indexes': [models.Index(fields=['full_name'], name='students_st_full_na_6ea9f7_idx'), models.Index(fields=['clerk_id'], name='students_st_clerk_i_997449_idx'), models.Index(fields=['email'], name='students_st_email_e271bc_idx'), models.Index(fields=['phone'], name='students_st_phone_86fc06_idx'), models.Index(fields=['hostel_block'], name='students_st_hostel__ff32d0_idx'), models.Index(fields=['room_number'], name='students_st_room_nu_96e148_idx')],
            },
        ),
    ]
