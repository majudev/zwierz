# Zwierz (2.x)

## Running locally
### First run
First, we have to clone our repo
```bash
git clone https://github.com/majudev/zwierz
```

Create `compose-local.yml`. This is configuration file for our local deployment.
```yaml
version: '3.4'

services:
  frontend:
    environment:
      REACT_APP_API_URL: http://localhost:8080/api
  backend:
    environment:
      BASEURL: http://localhost:8080
  nginx:
    ports:
      - "8080:8080"
```
For production use you should also change database password:
```yaml
  backend:
    environment:
      DATABASE_URL: mysql://master:sakjfsdfasfasersfedfsdfa@mysql:3306/master
  mysql:
    environment:
      MARIADB_PASSWORD: sakjfsdfasfasersfedfsdfa
```
Of course change **sakjfsdfasfasersfedfsdfa** to something random.
**Do not** modify `docker-compose.yml` as it will break updates! All changes
should be made via overriding settings in `compose-local.yml`.

Then build and start all of the containers
```bash
sudo docker compose -f docker-compose.yml -f compose-local.yml build
sudo docker compose -f docker-compose.yml -f compose-local.yml up -d
```
It takes a few minutes to start up, because front-end is rebuilt
every time container is started, to accomodate for environment
variable changes.

### Restarting
```bash
sudo docker compose -f docker-compose.yml -f compose-local.yml down
sudo docker compose -f docker-compose.yml -f compose-local.yml up -d
```

### Updating
```bash
git pull
sudo docker compose -f docker-compose.yml -f compose-local.yml build
sudo docker compose -f docker-compose.yml -f compose-local.yml down
sudo docker compose -f docker-compose.yml -f compose-local.yml up -d
```
It is important to issue the `down` command as docker sometimes
breaks DNS when automatically recreating containers using `up`. Shutting
everything down beforehand prevents this issue.
