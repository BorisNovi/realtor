from celery import Celery

app = Celery(main='task', broker='redis://localhost:6379/0')