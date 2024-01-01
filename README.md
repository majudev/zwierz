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
For production use you should also change database password. Of course change **sakjfsdfasfasersfedfsdfa** to something random.
```yaml
  backend:
    environment:
      DATABASE_URL: mysql://master:sakjfsdfasfasersfedfsdfa@mysql:3306/master
  mysql:
    environment:
      MARIADB_PASSWORD: sakjfsdfasfasersfedfsdfa
```
If you want to use cloudflared tunnel, also:
```yaml
  cloudflared:
    environment:
      TUNNEL_TOKEN: your_token_here

```
**Please don't ask us on how to generate cloudflared tunnel token.** Read their docs.

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

First time you start this deployment, the `database` folder will be created
and the database will be empty. You have to fill it with schema:
```bash
docker compose -f docker-compose.yml -f compose-local.yml run backend npx prisma db push
```

Then open mariadb console. As a password use one from `compose-local.yml` or `docker-compose.yml`.
```bash
docker compose -f docker-compose.yml -f compose-local.yml exec -ti mysql mariadb -u master -p master
```

In this console, you have to set up some configuration variables for the system to work properly.
```sql
INSERT INTO Settings(`key`,`value`) VALUES ('main.scribe.email', 'scribe@example.com');
INSERT INTO Settings(`key`,`value`) VALUES ('ovhSMS.account', 'sms-example');
INSERT INTO Settings(`key`,`value`) VALUES ('ovhSMS.login', 'login');
INSERT INTO Settings(`key`,`value`) VALUES ('ovhSMS.password', 'password');
INSERT INTO Settings(`key`,`value`) VALUES ('ovhSMS.from', 'Kapitula');
INSERT INTO Settings(`key`,`value`) VALUES ('postal.baseurl', 'https://postal.example.com');
INSERT INTO Settings(`key`,`value`) VALUES ('postal.apitoken', 'token');
INSERT INTO Settings(`key`,`value`) VALUES ('postal.from', 'no-reply@mail.example.com');
quit
```

Now you should restart your deployment.

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

### Logs
To see logs use one of the below commands (depending on what logs you want to see):
```bash
sudo docker compose -f docker-compose.yml -f compose-local.yml logs #see everything (absolute clutter)
sudo docker compose -f docker-compose.yml -f compose-local.yml logs backend #see only backend
sudo docker compose -f docker-compose.yml -f compose-local.yml logs frontend #see only frontend
sudo docker compose -f docker-compose.yml -f compose-local.yml logs nginx #see proxy that routes traffic to frontend and backend
sudo docker compose -f docker-compose.yml -f compose-local.yml logs cloudflared #if you configured cloudflare tunnel then it is helpful in debugging
```

Example logs of successful startup (backend):
```
$ sudo docker compose -f docker-compose.yml -f compose-local.yml logs backend
zwierz2-backend-1  | 
zwierz2-backend-1  | > backend@1.0.1 start
zwierz2-backend-1  | > node dist/index.js
zwierz2-backend-1  | 
zwierz2-backend-1  | 2024-01-01 14:40:08 [INFO]: Initializing DB
zwierz2-backend-1  | 2024-01-01 14:40:08 [INFO]: Server listening on http://127.0.0.1:9000
zwierz2-backend-1  | 2024-01-01 14:40:08 [DEBUG]: 1 users exist in the database, not adding default one
zwierz2-backend-1  | 2024-01-01 14:40:08 [DEBUG]: 1 teams exist in database, not adding default one
```

Example logs of successful startup (frontend):
```
$ sudo docker compose -f docker-compose.yml -f compose-local.yml logs frontend
zwierz2-frontend-1  | 
zwierz2-frontend-1  | > zwierz@0.1.0 build
zwierz2-frontend-1  | > react-scripts build
zwierz2-frontend-1  | 
zwierz2-frontend-1  | Creating an optimized production build...
...
...
...
zwierz2-frontend-1  | File sizes after gzip:
zwierz2-frontend-1  | 
zwierz2-frontend-1  |   86.77 kB (+7.35 kB)  build/static/js/main.9e9ad63a.js
zwierz2-frontend-1  |   27.99 kB             build/static/css/main.4de0fa12.css
zwierz2-frontend-1  |   1.77 kB              build/static/js/787.041706e9.chunk.js
zwierz2-frontend-1  | 
zwierz2-frontend-1  | The project was built assuming it is hosted at /.
zwierz2-frontend-1  | You can control this with the homepage field in your package.json.
zwierz2-frontend-1  | 
zwierz2-frontend-1  | The build folder is ready to be deployed.
zwierz2-frontend-1  | You may serve it with a static server:
zwierz2-frontend-1  | 
zwierz2-frontend-1  |   serve -s build
zwierz2-frontend-1  | 
zwierz2-frontend-1  | Find out more about deployment here:
zwierz2-frontend-1  | 
zwierz2-frontend-1  |   https://cra.link/deployment
zwierz2-frontend-1  | 
zwierz2-frontend-1  | (node:108) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
zwierz2-frontend-1  | (Use `node --trace-deprecation ...` to show where the warning was created)
zwierz2-frontend-1  |  INFO  Accepting connections at http://localhost:3000
```
