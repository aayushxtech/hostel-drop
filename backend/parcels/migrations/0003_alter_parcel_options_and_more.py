# Generated by Django 5.2.3 on 2025-06-13 23:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('parcels', '0002_alter_parcel_options_alter_parcel_received_time_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='parcel',
            options={'ordering': ['-created_at']},
        ),
        migrations.RemoveIndex(
            model_name='parcel',
            name='parcels_par_status_469061_idx',
        ),
        migrations.RemoveIndex(
            model_name='parcel',
            name='parcels_par_receive_4be07a_idx',
        ),
        migrations.RemoveIndex(
            model_name='parcel',
            name='parcels_par_student_41713b_idx',
        ),
        migrations.RemoveField(
            model_name='parcel',
            name='is_verified',
        ),
        migrations.RemoveField(
            model_name='parcel',
            name='pickup_code',
        ),
        migrations.RemoveField(
            model_name='parcel',
            name='received_time',
        ),
        migrations.RemoveField(
            model_name='parcel',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='parcel',
            name='verified_at',
        ),
        migrations.AlterField(
            model_name='parcel',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='service',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='parcel',
            name='status',
            field=models.CharField(choices=[('PENDING', 'Pending'), ('PICKED_UP', 'Picked Up')], default='PENDING', max_length=20),
        ),
    ]
