# TTPress
TTPress is a minimal blogging/news platform built with Express, sass and typeORM.

## Installation
- Install docker and docker-compose
- Download docker-compose.yaml file from ttpress repository using wget

```bash
wget https://raw.githubusercontent.com/alpinacloud/ttpress/master/docker-compose.yaml
```

- Create & set permissions for /data/ttpress folder, this folder will be used to hold ttpress files

```bash
mkdir -p /data/ttpress-stg
chmod 777 -R /data
```

- Replace `COOKIE_DOMAIN` in docker-compose with your domain name
- Replace `POSTGRES_SERVICE_PASSWORD` (postgres) and `POSTGRES_PASSWORD` (ttpress) with the same secure password
- Run:

```bash
docker-compose up -d
```

## Configure Nginx & Let's Encrypt
- Install nginx and create .conf file

```bash
sudo apt install nginx
cd /etc/nginx/sites-enabled
vi your_domain_name.conf
```

- Paste the following config and replace `yourdomainname.com` for `server_name`

```bash
server {
  server_name yourdomainname.com;

  set $upstream 127.0.0.1:4444;
  underscores_in_headers on;

  location /.well-known {
    alias /var/www/ssl-proof/ttpress/.well-known;
  }

  location / {
    proxy_pass_header Authorization;
    proxy_pass http://$upstream;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Ssl on;

    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_buffering off;

    client_max_body_size 0;
    proxy_read_timeout 36000s;
    proxy_redirect off;
  }

  listen 80;
}
```

- Verify that the configuration is valid and reload nginx
```bash
nginx -t
systemctl reload nginx
```

- Install certbot
```bash
apt install certbot python3-certbot-nginx
```

- Generate:

```bash
mkdir -p /var/www/ssl-proof/ttpress/.well-known
certbot --webroot -d yourdomainname.com -w /var/www/ssl-proof/ttpress/ -i nginx
```

- Done!