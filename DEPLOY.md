# Руководство по деплою urbancrm.app

Стек: Angular 21 + Django 5.1.6 + PostgreSQL 16 + Redis + Nginx + Docker
Домен: **urbancrm.app** (Cloudflare)
Сервер: **185.174.138.68** (Ubuntu 24.04, 2 CPU, 2 GB RAM, 20 GB SSD)

**Деплой происходит автоматически через GitHub Actions** — образы собираются в облаке и пушатся в GHCR, сервер только скачивает готовые образы.

---

## Часть 1 — Подготовка кода (делается один раз)

### 1.1 Email — настройка Resend

1. Зарегистрируйся на [resend.com](https://resend.com)
2. Добавь домен: **Domains → Add Domain → urbancrm.app**
3. Добавь DNS-записи в Cloudflare (Resend покажет какие — обычно TXT и MX)
4. Дождись верификации (статус Verified)
5. Создай API-ключ: **API Keys → Create API Key**
   - Permission: Sending access
   - **Domain: выбери `urbancrm.app`** (не "All domains" — иначе 550 ошибка при отправке)
6. Скопируй ключ вида `re_xxxxxxxxx` — он нужен для `.env.prod`

В `backend/.env.prod` используются такие настройки:
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=resend
EMAIL_HOST_PASSWORD=re_xxxxxxxxx       # твой API ключ
DEFAULT_FROM_EMAIL=noreply@urbancrm.app
```

### 1.2 Cloudflare — DNS и SSL

1. Зайди на [dash.cloudflare.com](https://dash.cloudflare.com) → выбери домен `urbancrm.app`
2. **DNS → Records** — добавь две записи:
   - Тип `A`, имя `@`, значение `185.174.138.68`, Proxy статус **Proxied** (оранжевое облако)
   - Тип `A`, имя `www`, значение `185.174.138.68`, Proxy статус **Proxied**
3. **SSL/TLS → Overview** — выбери режим **Full (strict)**
4. **SSL/TLS → Origin Server** → **Create Certificate**:
   - Тип ключа: RSA
   - Hostnames: `urbancrm.app`, `*.urbancrm.app`
   - Срок: 15 лет
   - Нажми **Create**
5. Скопируй и сохрани два файла:
   - **Origin Certificate** → `urbancrm.crt`
   - **Private Key** → `urbancrm.key`

   > Ключ показывается только один раз! Сохрани сразу.

6. **Speed → Optimization → Protocol Optimization → HTTP/3 (with QUIC) → Off**
   > Cloudflare включает HTTP/3 по умолчанию, но nginx не поддерживает QUIC — JS-чанки падают с ERR_QUIC_PROTOCOL_ERROR.

---

## Часть 2 — Настройка сервера (делается один раз)

### 2.1 Подключение к серверу

```bash
ssh root@185.174.138.68
```

### 2.2 Обновление системы

```bash
apt update && apt upgrade -y
```

### 2.3 Установка Docker (официальный репозиторий)

> Важно: в Ubuntu 24.04 `docker-compose-plugin` нет в стандартных репозиториях.
> Устанавливать нужно из официального репозитория Docker.

```bash
apt install -y gnupg ca-certificates curl

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Проверь:
```bash
docker --version
docker compose version
```

### 2.4 Настройка файрвола

```bash
apt install -y ufw
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
ufw status
```

### 2.5 Установка SSL-сертификата (Cloudflare Origin CA)

```bash
mkdir -p /etc/ssl/cloudflare

# Вставь содержимое Origin Certificate:
cat > /etc/ssl/cloudflare/urbancrm.crt << 'CERTEOF'
-----BEGIN CERTIFICATE-----
<содержимое сертификата из Cloudflare>
-----END CERTIFICATE-----
CERTEOF

# Вставь содержимое Private Key:
cat > /etc/ssl/cloudflare/urbancrm.key << 'CERTEOF'
-----BEGIN PRIVATE KEY-----
<содержимое ключа из Cloudflare>
-----END PRIVATE KEY-----
CERTEOF

chmod 644 /etc/ssl/cloudflare/urbancrm.crt
chmod 600 /etc/ssl/cloudflare/urbancrm.key

# Проверь:
ls -la /etc/ssl/cloudflare/
```

---

## Часть 3 — Настройка GitHub Actions CI/CD (делается один раз)

### 3.1 Генерация SSH-ключа для CI

На локальной машине создай пару ключей специально для GitHub Actions:

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""
```

Добавь публичный ключ на сервер:
```bash
cat ~/.ssh/github_actions.pub | ssh root@185.174.138.68 "cat >> ~/.ssh/authorized_keys"
```

### 3.2 Добавление секретов в GitHub

GitHub репозиторий → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Значение |
|---|---|
| `SERVER_HOST` | `185.174.138.68` |
| `SERVER_USER` | `root` |
| `SERVER_SSH_KEY` | содержимое `~/.ssh/github_actions` (приватный ключ) |

Просмотреть приватный ключ:
```bash
cat ~/.ssh/github_actions
```

### 3.3 Как работает CI/CD

При каждом пуше в `main`:
1. GitHub Actions собирает Docker-образы фронта и бэка (7 GB RAM, быстро)
2. Пушит образы в GHCR: `ghcr.io/borisnovi/realtor-frontend:latest` и `ghcr.io/borisnovi/realtor-backend:latest`
3. Копирует `docker-compose.prod.yml` на сервер через SCP
4. Заходит на сервер по SSH, скачивает новые образы и перезапускает контейнеры

При пуше git-тега `v*` (например `v1.2.0`):
- Дополнительно создаётся версионный образ `ghcr.io/borisnovi/realtor-frontend:v1.2.0`

---

## Часть 4 — Первый деплой приложения

### 4.1 Клонирование репозитория

```bash
cd /opt
git clone https://github.com/BorisNovi/realtor.git
cd realtor
```

При запросе логина/пароля — вводи GitHub username и Personal Access Token
(GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → scope: repo)

### 4.2 Создание .env.prod

```bash
cat > /opt/realtor/backend/.env.prod << 'EOF'
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<сгенерируй ниже>
ALLOWED_HOSTS=urbancrm.app,www.urbancrm.app
BASE_URL=https://urbancrm.app
CORS_ALLOWED_ORIGINS=https://urbancrm.app,https://www.urbancrm.app

DATABASE_NAME=realtor_db
DATABASE_USER=realtor_user
DATABASE_PASSWORD=<сгенерируй ниже>
DATABASE_HOST=postgres
DATABASE_PORT=5432

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=<сгенерируй ниже>
USE_REDIS=True

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=resend
EMAIL_HOST_PASSWORD=re_xxxxxxxxx
DEFAULT_FROM_EMAIL=noreply@urbancrm.app

SECURE_SSL_REDIRECT=False
EOF
```

Генерация паролей:
```bash
echo "SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")"
echo "DATABASE_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")"
echo "REDIS_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")"
```

### 4.3 Первый запуск

Запушь что-нибудь в `main` — GitHub Actions автоматически соберёт и задеплоит.
Или запусти вручную через GitHub CLI:

```bash
gh workflow run deploy.yml --ref main
```

Или через GitHub UI: **Actions → Build & Deploy → Run workflow → main → Run workflow**

> Первый запуск занимает 3–5 минут (скачивает образы из GHCR).

### 4.4 Проверка

```bash
cd /opt/realtor
docker compose -f docker-compose.prod.yml --env-file backend/.env.prod ps
```

Все контейнеры должны быть в статусе `running`:
- `realtor-frontend-1`
- `realtor-backend-1`
- `realtor-postgres-1`
- `realtor-redis-1`
- `realtor-nginx-1`

Открой в браузере: **https://urbancrm.app**

---

## Часть 5 — Обновление и откат

### 5.1 Обычное обновление

Просто пушишь в `main` — CI/CD сам всё сделает.

### 5.2 Версионный деплой (с тегом)

```bash
git tag v1.2.0
git push origin v1.2.0
```

Actions создаст образы с тегами `v1.2.0` и `latest`.

### 5.3 Откат на предыдущую версию

Через GitHub UI: **Actions → Build & Deploy → Run workflow**
- Введи в поле `tag`: например `v1.1.0`
- Нажми **Run workflow**

Actions пропустит сборку и задеплоит указанную версию.

### 5.4 Обновить только переменную окружения (без пересборки)

```bash
sed -i 's/EMAIL_HOST_PASSWORD=.*/EMAIL_HOST_PASSWORD=re_новый_ключ/' /opt/realtor/backend/.env.prod
# restart не подхватывает новый env — нужно пересоздать контейнер:
docker compose -f docker-compose.prod.yml --env-file backend/.env.prod up -d backend
```

---

## Часть 6 — Полезные команды на сервере

```bash
# Статус контейнеров:
docker compose -f docker-compose.prod.yml --env-file backend/.env.prod ps

# Логи всех контейнеров:
docker compose -f docker-compose.prod.yml logs -f

# Логи только бэкенда:
docker compose -f docker-compose.prod.yml logs -f backend

# Остановить всё:
docker compose -f docker-compose.prod.yml down

# Остановить и удалить данные (осторожно! БД тоже сотрётся):
docker compose -f docker-compose.prod.yml down -v

# Перезапустить один сервис:
docker compose -f docker-compose.prod.yml restart nginx

# Войти в контейнер бэкенда:
docker exec -it realtor-backend-1 bash

# Выполнить manage.py команду:
docker exec realtor-backend-1 python manage.py <команда>

# Посчитать зарегистрированных пользователей:
DB_USER=$(grep ^DATABASE_USER backend/.env.prod | cut -d= -f2)
DB_NAME=$(grep ^DATABASE_NAME backend/.env.prod | cut -d= -f2)
docker compose -f docker-compose.prod.yml --env-file backend/.env.prod exec postgres psql -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM users_user;"

# Очистить кеш Docker (освобождает 1-3 GB, volumes не трогает):
docker system prune -a

# Использование памяти:
free -m

# Место на диске:
df -h
```

---

## Архитектура

```
Разработчик → git push → GitHub Actions
                              ├── сборка образов (ubuntu-latest, 7 GB RAM)
                              ├── push в GHCR (ghcr.io/borisnovi/*)
                              └── SSH deploy на сервер
                                      ├── SCP docker-compose.prod.yml
                                      ├── docker pull новых образов
                                      └── docker compose up -d

Браузер → Cloudflare (proxy) → Nginx (443 SSL)
                                    ├── /api/*, /admin → backend:8000 (Gunicorn + Django)
                                    ├── /uploads/      → volume mediafiles (напрямую)
                                    ├── /static/       → volume staticfiles (напрямую)
                                    └── /              → frontend:80 (Nginx + Angular SPA + SSR)
```

SSL-сертификат: Cloudflare Origin CA (15 лет, только для трафика через Cloudflare proxy).
Cloudflare → сервер: Full (strict) — шифруется на всём пути.

---

## Структура файлов проекта

```
realtor/
├── .github/workflows/
│   └── deploy.yml          # CI/CD: сборка образов + деплой
├── frontend/
│   ├── Dockerfile          # Node 20 Alpine (сборка) + Nginx (раздача)
│   ├── nginx.conf          # конфиг nginx внутри frontend-контейнера
│   └── src/
├── backend/
│   ├── Dockerfile          # dev: runserver
│   ├── Dockerfile.prod     # prod: collectstatic + migrate + gunicorn
│   ├── .env                # локальная разработка (не коммитить)
│   ├── .env.prod           # production (не коммитить, создаётся на сервере)
│   └── .env.example        # шаблон (коммитится)
├── nginx/
│   └── prod.conf           # Cloudflare Origin CA + роутинг
├── docker-compose.yml          # dev
├── docker-compose.prod.yml     # production (образы из GHCR)
└── package.json                # скрипты для удобства
```

---

## Переменные окружения (справочник)

| Переменная | dev | prod |
|---|---|---|
| `ENVIRONMENT` | `development` | `production` |
| `DEBUG` | `True` | `False` |
| `DATABASE_HOST` | `localhost` | `postgres` (имя Docker-сервиса) |
| `REDIS_HOST` | `localhost` | `redis` (имя Docker-сервиса) |
| `USE_REDIS` | `False` | `True` |
| `SECURE_SSL_REDIRECT` | `False` | `False` (nginx делает редирект) |
| `EMAIL_BACKEND` | `console` | `smtp` |
