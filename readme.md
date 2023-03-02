# Clean Wordpress Install Starter

Containerized in docker using docker compose.

## Docker

---
## First Start

These steps only need to to be done once for the whole server:

1. Make sure database will allow remote access (see "Allow Remote Access to DB" below 👇)
2. Allow docker network access to database port
   * To only let docker network in, not any other outside connection
   * Example → `sudo ufw allow in on docker0 to any port 3306`

These steps are what need to be done on each install:

1. Make sure permissions are right for files --> `wordpressFiles` (if not already done)
   1. Set ownership `chown -R $USER:www-data wordpressFiles` and permissions `chmod -R 774 wordpressFiles`
   2. Set group Id `chmod -R g+s wordpressFiles` - means that all new files and subdirectories created in it will be given the same group as the parent
   3. This allows editing of the wordpress files without using `sudo` outside of the container.
2. Create file `.env` (example `.env-example`) permissions set to `chmod 660 .env`
   1. Only allow owner, and group read and write permission, and none for other users.
3. Set a `CONTAINER_NAME` and `PORT` to your new `.env` file and the `DB_..` variables.
4. Confirm `docker-compose.yml` file is set with `network_mode: bridge` and 👇:

```yml
extra_hosts:
   host.docker.internal: host-gateway
```

5. Run `docker-compose up -d` to produce the files and bring the container up.
6. Profit!

### Environment variables

Must create a `.env` file and add variables there. Use `.env-example` as a template.

```.env
WP_EXTERNAL_PORT=
CONTAINER_NAME=websitename.com

DB_PORT=3306
DB_USER=db_user
DB_PASSWORD=db_pass
DB_NAME=databasename
```

### Common Commands

`docker-compose` commands require that you `cd` to the directory that the `docker-compose.yml` file is locationed. Most `docker` commands can be run from anywhere.

#### Start the container

Downloads images if needed and boots up the service. `-d` puts it into a daemon/background service.

```bash
docker-compose up -d
```

#### Stop the container

```bash
docker-compose down
```

#### List containers

```bash
docker-compose ps
```

More information than just the current directory

```bash
docker ps
```

#### Logs of the container

```bash
docker-compose logs
```

#### Run bash inside of the container

Can get `CONTAINER_NAME` from `docker-compose ps`. To exit use the `exit` command.

```bash
docker exec -it CONTAINER_NAME bash
```


Reference: [https://www.digitalocean.com/community/tutorials/how-to-allow-remote-access-to-mysql](https://www.digitalocean.com/community/tutorials/how-to-allow-remote-access-to-mysql)

### Step 1

The config file to edit could be different depending on settings and version of mysql/mariadb: [https://mariadb.com/kb/en/configuring-mariadb-for-remote-client-access/](https://mariadb.com/kb/en/configuring-mariadb-for-remote-client-access/)

To doulbe check which config file is being used

`mysqld --help --verbose`

```text
shell> mysqld --help --verbose
./sql/mysqld  Ver 10.4.2-MariaDB-valgrind-max-debug for Linux on x86_64 (Source distribution)
Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Starts the MariaDB database server.

Usage: ./sql/mysqld [OPTIONS]

Default options are read from the following files in the given order:
/etc/my.cnf /etc/mysql/my.cnf ~/.my.cnf <--- This is the order the config files are loaded
```

Edit ```/etc/mysql/my.cnf```

Change `bind-address = 127.0.0.1` to `bind-address = 0.0.0.0`

### Step 2

Restart mariadb service `sudo systemctl restart mariadb`

### Step 3

Need to have a db user that ether has a host set to the specific IP address of the host ('user@48.22.16.5') or the wild card('%') host of `user@%`

#### Example SQL

```sql
CREATE USER 'user_name'@'179.22.34.9' IDENTIFIED BY 'great password'; GRANT ALL PRIVILEGES ON *.* TO 'user_name'@'179.22.34.9' WITH GRANT OPTION;
```

```sql
CREATE USER 'user_name'@'%' IDENTIFIED BY 'great password'; GRANT ALL PRIVILEGES ON *.* TO 'user_name'@'%' WITH GRANT OPTION;
```
<<<<<<< HEAD
=======

Now you should have a user to login to the admin area.
>>>>>>> dev--extra-help
