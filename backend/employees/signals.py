import logging
import smtplib

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Employee

logger = logging.getLogger(__name__)


def _send_employee_welcome_email(recipient, full_name, employee_id):
    if not settings.EMAIL_HOST or not settings.DEFAULT_FROM_EMAIL:
        logger.error(
            "Employee welcome email was not sent because SMTP host or sender "
            "is not configured (employee id %s).",
            employee_id,
        )
        return

    name = full_name or "there"
    subject = "Welcome to Employee System"
    message = (
        f"Hello {name},\n\n"
        "Your employee account has been created.\n"
        f"Sign in with your email address at {settings.FRONTEND_URL}/login.\n\n"
        "For your security, your password is not included in this email. "
        "Please contact your administrator if you need help signing in."
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[recipient],
            fail_silently=False,
        )
    except (OSError, smtplib.SMTPException):
        logger.exception(
            "Failed to send employee welcome email (employee id %s).",
            employee_id,
        )


@receiver(post_save, sender=Employee, dispatch_uid="employees.employee_welcome_email")
def send_employee_welcome_email(sender, instance, created, **kwargs):
    if not created or not instance.user_id:
        return

    recipient = instance.user.email
    if not recipient:
        logger.error(
            "Employee welcome email was not sent because the employee has no "
            "email address (employee id %s).",
            instance.pk,
        )
        return

    transaction.on_commit(
        lambda: _send_employee_welcome_email(
            recipient,
            instance.user.get_full_name(),
            instance.pk,
        )
    )
