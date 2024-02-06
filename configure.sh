#!/bin/bash

POSITIONAL_ARGS=()

while [[ $# -gt 0 ]]; do
  case $1 in
    --mysql-password)
      MYSQL_PASSWORD="$2"
      shift # past argument
      shift # past value
      ;;
    --url)
      URL="$2"
      shift # past argument
      shift # past value
      ;;
    --port)
      PORT="$2"
      shift # past argument
      shift # past value
      ;;
    -*|--*)
      echo "Unknown option $1"
      exit 1
      ;;
    *)
      POSITIONAL_ARGS+=("$1") # save positional arg
      shift # past argument
      ;;
  esac
done

set -- "${POSITIONAL_ARGS[@]}"

TEMP=`mktemp -d`

echo "version: '3.4'" > compose-local.yml
if [[ "$MYSQL_PASSWORD" != "" ]]; then
	cat docker-compose.yml | grep DATABASE_URL | sed 's/sakjfsdfasfasersfedfsdfa/'"$MYSQL_PASSWORD"'/g' >> $TEMP/backend.yml
	cat docker-compose.yml | grep MARIADB_PASSWORD | sed 's/sakjfsdfasfasersfedfsdfa/'"$MYSQL_PASSWORD"'/g' >> $TEMP/mysql.yml
fi

if [[ "$URL" != "" ]]; then
	cat docker-compose.yml | grep BASEURL | sed 's_http://localhost:8080_'"$URL"'_g' >> $TEMP/backend.yml
	cat docker-compose.yml | grep REACT_APP_API_URL | sed 's_http://localhost:8080_'"$URL"'_g' >> $TEMP/frontend.yml
fi


if [[ "$PORT" != "" ]] || [ -z "$(ls -A $TEMP)" ]; then
	echo 'services:' >> compose-local.yml
fi


if [[ "$PORT" != "" ]]; then
cat << EOF >> compose-local.yml
  nginx:
    ports:
      - "$PORT:8080"
EOF
fi

if [ -e $TEMP/backend.yml ]; then
	cat << EOF >> compose-local.yml
  backend:
    environment:
EOF
	cat $TEMP/backend.yml >> compose-local.yml
fi

if [ -e $TEMP/frontend.yml ]; then
	cat << EOF >> compose-local.yml
  frontend:
    environment:
EOF
	cat $TEMP/frontend.yml >> compose-local.yml
fi

if [ -e $TEMP/mysql.yml ]; then
	cat << EOF >> compose-local.yml
  mysql:
    environment:
EOF
	cat $TEMP/mysql.yml >> compose-local.yml
fi

rm -r $TEMP
