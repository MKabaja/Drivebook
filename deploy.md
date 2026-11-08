# Deploy DriveBook na własny serwer (Hetzner)

Instrukcja uruchomienia aplikacji na serwerze z Dockerem i nginxem, także obok innych projektów.
W przykładach domena to `drivebook.duckdns.org`, a `SERWER` to Twój host SSH. Zastąp je własnymi wartościami.
Komendy na serwerze wykonujesz jako `root`. Przy innym użytkowniku dodaj `sudo`.

## Jak to działa

```text
przeglądarka ── HTTPS ──> nginx na hoście
                            ├─ /            -> pliki z frontend/dist (SPA)
                            ├─ /storage/    -> zdjęcia aut z storage/app/public
                            └─ /api, /sanctum -> FastCGI -> PHP-FPM (127.0.0.1:9001, kontener app)
                                                              └─> MySQL 8.4 (kontener mysql, bez portu na zewnątrz)
```

- SPA i API są na jednej domenie, więc sesja Sanctum działa na zwykłych ciasteczkach, bez CORS między domenami.
- nginx rozmawia z PHP-FPM bezpośrednio przez FastCGI. Laravel widzi prawdziwy adres klienta, więc limity logowania i rejestracji liczą się osobno dla każdego IP.
- `compose.yaml` to Sail, czyli wyłącznie środowisko deweloperskie. Na serwerze go nie uruchamiaj: wystawia MySQL na wszystkich interfejsach.
- Aplikacja nie potrzebuje workera kolejek ani crona.

## Wymagania

- Ubuntu lub Debian z Dockerem i Compose 2.17 lub nowszym.
- nginx i certbot na hoście.
- Na komputerze, z którego wdrażasz: Node 24 i `rsync`.

## Pierwsze uruchomienie

### 1. Domena

Na [duckdns.org](https://www.duckdns.org) dodaj subdomenę i ustaw ją na IP serwera. Sprawdź z laptopa:

```bash
dig +short drivebook.duckdns.org
```

### 2. Sprawdzenie serwera

```bash
ssh SERWER
docker compose version
nginx -v
ss -tln | grep 9001   # brak wyniku oznacza, że port jest wolny
```

Jeśli port 9001 jest zajęty, użyj innego w kroku 4 i w vhoście z kroku 8.

### 3. Pobranie kodu

```bash
git clone https://github.com/MKabaja/DriveBook.git /var/www/drivebook
cd /var/www/drivebook
```

### 4. Plik Compose

Plik zostaje na serwerze, poza repozytorium:

```bash
cat > compose.production.yaml <<'EOF'
name: drivebook

services:
    app:
        build:
            context: ./docker
            dockerfile_inline: |
                FROM php:8.5-fpm
                RUN apt-get update \
                    && apt-get install -y --no-install-recommends git unzip libzip-dev \
                    && docker-php-ext-install pdo_mysql zip \
                    && rm -rf /var/lib/apt/lists/*
                COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
                RUN cp "$$PHP_INI_DIR/php.ini-production" "$$PHP_INI_DIR/php.ini"
                WORKDIR /var/www/html
        image: drivebook-app
        restart: unless-stopped
        ports:
            - '127.0.0.1:9001:9000'
        volumes:
            - '.:/var/www/html'
        depends_on:
            mysql:
                condition: service_healthy

    mysql:
        image: mysql:8.4
        restart: unless-stopped
        environment:
            MYSQL_ROOT_PASSWORD: '${DB_ROOT_PASSWORD}'
            MYSQL_DATABASE: '${DB_DATABASE}'
            MYSQL_USER: '${DB_USERNAME}'
            MYSQL_PASSWORD: '${DB_PASSWORD}'
        volumes:
            - 'mysql-data:/var/lib/mysql'
        healthcheck:
            test: ['CMD-SHELL', 'mysqladmin ping -h 127.0.0.1 -uroot -p"$$MYSQL_ROOT_PASSWORD"']
            interval: 5s
            timeout: 5s
            retries: 20

volumes:
    mysql-data:
EOF
```

### 5. Konfiguracja `.env`

Skrypt generuje klucz aplikacji i hasła:

```bash
DOMAIN=drivebook.duckdns.org
cp .env.example .env
sed -i -E \
    -e 's|^APP_ENV=.*|APP_ENV=production|' \
    -e 's|^APP_DEBUG=.*|APP_DEBUG=false|' \
    -e "s|^APP_URL=.*|APP_URL=https://${DOMAIN}|" \
    -e "s|^APP_KEY=.*|APP_KEY=base64:$(openssl rand -base64 32)|" \
    -e 's|^LOG_LEVEL=.*|LOG_LEVEL=warning|' \
    -e 's|^DB_USERNAME=.*|DB_USERNAME=drivebook|' \
    -e "s|^DB_PASSWORD=.*|DB_PASSWORD=$(openssl rand -hex 24)|" \
    -e "s|^SANCTUM_STATEFUL_DOMAINS=.*|SANCTUM_STATEFUL_DOMAINS=${DOMAIN}|" \
    -e "s|^FRONTEND_URL=.*|FRONTEND_URL=https://${DOMAIN}|" \
    .env
cat >> .env <<EOF

DB_ROOT_PASSWORD=$(openssl rand -hex 24)
SESSION_SECURE_COOKIE=true
COMPOSE_FILE=compose.production.yaml
EOF
```

`COMPOSE_FILE` sprawia, że samo `docker compose` w tym katalogu używa pliku produkcyjnego, więc Saila nie uruchomisz przez pomyłkę.

### 6. Start kontenerów i baza

```bash
docker compose up -d --build --wait
docker compose exec app composer install --no-dev --optimize-autoloader --no-interaction
docker compose exec app sh -c 'chown -R www-data:www-data storage bootstrap/cache && chown root:www-data .env && chmod 640 .env'
docker compose exec -u www-data app php artisan migrate --force
docker compose exec -u www-data app php artisan db:seed --force
docker compose exec -u www-data app php artisan config:cache
docker compose exec -u www-data app php artisan route:cache
```

Seeder uruchamiasz tylko ten jeden raz. Dodaje 18 aut ze zdjęciami, bez kont użytkowników, więc konto zakładasz w aplikacji.

### 7. Frontend

Budujesz na swoim komputerze, z aktualnego `main`:

```bash
npm --prefix frontend ci
npm --prefix frontend run build
rsync -avz --delete frontend/dist/ SERWER:/var/www/drivebook/frontend/dist/
```

### 8. nginx i HTTPS

```bash
cat > /etc/nginx/sites-available/drivebook <<'EOF'
server {
    listen 80;
    server_name drivebook.duckdns.org;

    root /var/www/drivebook/frontend/dist;
    index index.html;

    location ~ ^/(api|sanctum)(/|$) {
        include fastcgi_params;
        fastcgi_pass 127.0.0.1:9001;
        fastcgi_param SCRIPT_FILENAME /var/www/html/public/index.php;
        fastcgi_param SCRIPT_NAME /index.php;
        fastcgi_param HTTPS $https if_not_empty;
    }

    location ^~ /storage/ {
        alias /var/www/drivebook/storage/app/public/;
        expires 30d;
        access_log off;
    }

    location ^~ /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    location / {
        try_files $uri /index.html;
    }
}
EOF
ln -s /etc/nginx/sites-available/drivebook /etc/nginx/sites-enabled/drivebook
nginx -t && systemctl reload nginx
certbot --nginx -d drivebook.duckdns.org --redirect
```

### 9. Sprawdzenie

```bash
curl -I https://drivebook.duckdns.org/
curl -s https://drivebook.duckdns.org/api/cars | head -c 300
ss -tln | grep -E '3306|9001'
```

Oczekiwany wynik: strona zwraca 200, API listę aut, a port 9001 jest związany tylko z `127.0.0.1`.
Potem w przeglądarce załóż konto, zarezerwuj auto kartą `4242 4242 4242 4242` i anuluj rezerwację.

## Aktualizacja

Na serwerze:

```bash
cd /var/www/drivebook
git pull --ff-only
docker compose exec app composer install --no-dev --optimize-autoloader --no-interaction
docker compose exec app chown -R www-data:www-data storage bootstrap/cache
docker compose exec -u www-data app php artisan migrate --force
docker compose exec -u www-data app php artisan config:cache
docker compose exec -u www-data app php artisan route:cache
```

Na swoim komputerze powtórz krok 7. Po każdej zmianie `.env` uruchom ponownie `config:cache`.

## Kopia bazy

```bash
docker compose exec -T mysql sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" drivebook' | gzip > ~/drivebook-$(date +%F).sql.gz
```

Nie używaj `docker compose down -v`, bo ta komenda usuwa wolumen z bazą.

## Gdy coś nie działa

| Objaw | Co sprawdzić |
| --- | --- |
| 502 na `/api` | `docker compose ps`, czy kontener `app` działa i czy port w vhoście zgadza się z Compose |
| 500 z API | `storage/logs/laravel.log`, potem właściciel `storage` i `bootstrap/cache` (krok 6) |
| 419 przy logowaniu | `SANCTUM_STATEFUL_DOMAINS` to dokładnie domena strony, bez `https://`; po zmianie `config:cache` |
| Logowanie działa, ale po odświeżeniu sesji nie ma | `SESSION_SECURE_COOKIE=true` wymaga wejścia przez HTTPS |
| Brak zdjęć aut | czy seeder przeszedł i czy nginx ma dostęp do `storage/app/public` |
| Stara wersja strony | czy `rsync` przeszedł, potem twarde odświeżenie |
