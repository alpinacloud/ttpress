# TTPress

## Installation
- Install docker and docker-compose
- Download docker-compose.yaml file from ttpress repo
- Create & set permissions for /data/ttpress folder, this folder will be used to hold ttpress files
```sh
mkdir -p /data/ttpress-stg
chmod 777 -R /data
```
- Replace `COOKIE_DOMAIN` in docker-compose with your domain name
- Replace `POSTGRES_SERVICE_PASSWORD` (postgres) and `POSTGRES_PASSWORD` (ttpress) with the same secure password
- Run:
```sh
  docker-compose up -d
```

