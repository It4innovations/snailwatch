import os
import traceback
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from os.path import dirname
from smtplib import SMTP_SSL

import jinja2
from flask import current_app as app

from ...configuration import get_email_sender, get_public_url, \
    get_smtp_password, get_smtp_server, get_smtp_user
from ...lib.util import clean_key


def read_template(path):
    loader = jinja2.FileSystemLoader(
        searchpath=os.path.join(dirname(dirname(__file__)), 'templates'))
    env = jinja2.Environment(loader=loader)
    env.lstrip_blocks = True
    env.trim_blocks = True
    return env.get_template(path)


def send_email(server, user, password, sender, receiver, subject, msg):
    email = MIMEMultipart('alternative')
    email['Subject'] = subject
    email['From'] = sender
    email['To'] = receiver

    for part in (MIMEText(msg, 'plain'), MIMEText(msg, 'html')):
        email.attach(part)

    with SMTP_SSL(server) as smtp:
        smtp.login(user, password)
        smtp.sendmail(sender, [receiver], email.as_string())


def notify_regressions(user, project, regressions):
    if not user['email'] or not regressions:
        return

    public_url = get_public_url()
    if public_url:
        public_url = '{}/dashboard/line/{{}}'.format(public_url.rstrip('/'))

    msg = read_template('regression-email.html').render(
        user=user,
        project=project,
        regressions=regressions,
        clean_key=clean_key,
        public_url=public_url
    )
    email = user['email']

    try:
        send_email(
            get_smtp_server(),
            get_smtp_user(),
            get_smtp_password(),
            get_email_sender(),
            email,
            'Snailwatch: regression(s) detected in {}'.format(
                project['name']),
            msg
        )
        app.logger.info('Sent regression e-mail to {}'.format(email))
    except Exception as e:
        app.logger.error('Regression e-mail send failed: {}'.format(str(e)))
        traceback.print_exc()
