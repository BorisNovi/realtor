# Деплой — статус и инструкция

Ветка: `chore/production-setup` (от `main`)
Тег до изменений: `v0.1.1` (снимок состояния до деплой-изменений)

---

## Что уже сделано в этой ветке

### backend/realtor/settings.py
- `DEBUG`, `SECRET_KEY`, `BASE_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `EMAIL_BACKEND` — перенесены из хардкода в `.env`
- Добавлена переменная `ENVIRONMENT` (`development` | `staging` | `production`)
- Redis поддерживает пароль (`REDIS_PASSWORD`)
- `BrowsableAPIRenderer` только на `development` и `staging` (на проде скрыт)
- Уровень логирования: `DEBUG` на dev, `WARNING` на staging/prod
- Security-настройки (`HSTS`, `SSL redirect`, `secure cookies`) включаются автоматически при `DEBUG=False`
- `SECURE_PROXY_SSL_HEADER` — Django доверяет заголовку nginx `X-Forwarded-Proto` (без этого был бы бесконечный редирект)
- `STATIC_ROOT = BASE_DIR / 'staticfiles'` — куда collectstatic складывает файлы

### backend/.env
- Обновлён под новые имена переменных (`DATABASE_NAME` вместо `DB_NAME` и т.д.)
- Добавлены все новые переменные (`ENVIRONMENT`, `SECRET_KEY`, `ALLOWED_HOSTS`, etc.)
- Для локальной разработки: `DEBUG=True`, `USE_REDIS=False`

### backend/.env.example
- Полностью переписан: все переменные с комментариями и примерами для каждого окружения
- Коммитится в git — восстановить `.env` всегда можно по нему

### backend/.gitignore
- Добавлены `.env.prod` и `.env.staging` (не коммитить!)

### backend/requirements.txt
- Перекодирован из UTF-16 в UTF-8
- Добавлен `gunicorn==21.2.0`

### backend/Dockerfile
- Переименован из `dockerfile` → `Dockerfile` (с большой буквы — важно для Linux)

### backend/Dockerfile.prod
- Создан новый файл для production
- Запускает: `collectstatic → migrate → gunicorn` (4 воркера)
- Используется в `docker-compose.prod.yml`

### docker-compose.yml (dev)
- Убран хардкод паролей из `environment:` блока
- `env_file: ./backend/.env` + переопределяем только docker-специфичное (`DATABASE_HOST=postgres`, `REDIS_HOST=redis`)
- Redis пинован: `redis:7-alpine` вместо `latest`
- Порты 5432 и 6379 остаются открытыми (для локальной отладки через pgAdmin/redis-cli)
- Убран `sleep 10` (health check postgres делает это правильно)

### docker-compose.prod.yml
- Создан новый файл для staging и production
- Postgres и Redis НЕ пробрасывают порты наружу (только внутри Docker-сети)
- Backend за nginx (порт 8000 не открыт)
- Redis с паролем: `redis-server --requirepass ${REDIS_PASSWORD}`
- Nginx-контейнер: SSL, роутинг
- Shared volumes: `mediafiles` и `staticfiles` между backend и nginx

### nginx/prod.conf
- Создан новый файл
- HTTP → HTTPS редирект
- Роутинг: `/api/*`, `/admin` → backend; `/media/` → volume напрямую; `/static/` → volume напрямую; `/` → frontend SPA
- Заголовок `X-Forwarded-Proto` передаётся в Django

---

## Что ещё НЕ сделано

### На сервере (делается вручную, не коммитится)

- [ ] Установить Docker: `curl -fsSL https://get.docker.com | sh`
- [ ] Склонировать репозиторий: `git clone <repo> /opt/realtor`
- [ ] Создать `backend/.env.prod` по шаблону `backend/.env.example`
- [ ] Создать `backend/.env.staging` по шаблону `backend/.env.example`
- [ ] Сгенерировать `SECRET_KEY`: `python3 -c "import secrets; print(secrets.token_urlsafe(50))"`
- [ ] Поставить реальный домен в `nginx/prod.conf` (заменить `YOUR_DOMAIN`)
- [ ] Настроить firewall: открыть только 80, 443, 22 (`ufw allow 80 && ufw allow 443 && ufw allow 22 && ufw enable`)

### SSL-сертификат (Let's Encrypt)

```bash
sudo apt install certbot

# Production:
sudo certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com \
  --email your@email.com --agree-tos --no-eff-email

# Staging:
sudo certbot certonly --standalone \
  -d staging.yourdomain.com \
  --email your@email.com --agree-tos --no-eff-email
```

Сертификаты появятся в `/etc/letsencrypt/live/yourdomain.com/` — nginx подключает их через volume.

Автообновление (добавить в cron):
```bash
sudo crontab -e
# Добавить:
0 3 * * * certbot renew --quiet && docker compose -f /opt/realtor/docker-compose.prod.yml restart nginx
```

### Запуск на сервере

```bash
cd /opt/realtor

# Production:
docker compose -f docker-compose.prod.yml --env-file backend/.env.prod up -d --build

# Staging (на том же сервере — отдельный проект Docker):
docker compose -f docker-compose.prod.yml --env-file backend/.env.staging -p realtor-staging up -d --build
```

Флаг `-p realtor-staging` задаёт имя проекта — staging и prod не конфликтуют по именам контейнеров и volumes.

### Если staging на том же сервере, что и prod

Nginx-конфиг нужно расширить вторым `server` блоком для staging-домена.
Либо создать отдельный `nginx/staging.conf` и передавать его через отдельный volume в staging-compose.

### Ещё не решено

- [ ] Email в production: настроить SMTP (`EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend` + `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` в `.env.prod`)
- [ ] Проверить, что `frontend/Dockerfile` собирает Angular с правильным `API_URL` (сейчас там может быть захардкожен `localhost:8000`)
- [ ] Настроить GitHub Actions или другой CI/CD для автодеплоя при пуше в `main`

---

## Архитектура окружений

| Переменная | development | staging | production |
|---|---|---|---|
| `ENVIRONMENT` | `development` | `staging` | `production` |
| `DEBUG` | `True` | `False` | `False` |
| `BrowsableAPI` | Да | Да | Нет |
| `Logging level` | DEBUG | WARNING | WARNING |
| `Security headers` | Нет | Да | Да |
| `Redis password` | Нет | Да | Да |
| `Gunicorn` | Нет (runserver) | Да | Да |
| `compose file` | `docker-compose.yml` | `docker-compose.prod.yml` | `docker-compose.prod.yml` |
| `env file` | `backend/.env` | `backend/.env.staging` | `backend/.env.prod` |

---

## Структура новых файлов

```
realtor/
├── docker-compose.yml          # dev (обновлён)
├── docker-compose.prod.yml     # staging + production (новый)
├── nginx/
│   └── prod.conf               # nginx конфиг (новый, домен нужно заменить)
├── backend/
│   ├── Dockerfile              # переименован из dockerfile
│   ├── Dockerfile.prod         # новый, с gunicorn
│   ├── requirements.txt        # добавлен gunicorn, перекодирован в UTF-8
│   ├── .env                    # обновлён (не коммитить)
│   ├── .env.example            # обновлён, коммитится в git
│   └── realtor/
│       └── settings.py         # всё через env vars, security-блок
```
