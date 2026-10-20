from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("marketplace", "0004_alter_projectmessage_attachment"),
    ]

    operations = [
        migrations.AddIndex(
            model_name="project",
            index=models.Index(fields=["status", "-created_at"], name="prj_status_created_idx"),
        ),
        migrations.AddIndex(
            model_name="projectmessage",
            index=models.Index(fields=["project", "-created_at"], name="msg_project_created_idx"),
        ),
        migrations.AddIndex(
            model_name="rating",
            index=models.Index(fields=["to_user", "-created_at"], name="rating_to_created_idx"),
        ),
    ]