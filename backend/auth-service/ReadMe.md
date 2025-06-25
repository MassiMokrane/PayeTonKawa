# 📘 Guide de Connexion à MySQL Docker – Projet PayeTonKawa

## 🎯 Objectif

Ce fichier t'explique **tout ce que tu as mis en place** pour connecter ta base de données MySQL via Docker, comment la voir depuis ta machine, et **quoi faire en cas de blocage** (ex: port déjà utilisé). Tu pourras t’y référer plus tard pour ne pas perdre de temps.

---

## 🛠️ 1. Base de données utilisée

- **Nom de la base** : `authdb`
- **Table principale** : `users`
- **Port exposé** : `3306` (par défaut)
- **Mot de passe root** : `root`

---

## 🐳 2. Configuration Docker (docker-compose.yml)

```yaml
services:
  mysql-auth:
    image: mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: authdb
✅ Le port 3306 de ta machine est mappé sur le port 3306 du conteneur MySQL.

🧪 3. Comment se connecter à la base depuis ta machine
📌 A. En ligne de commande :
bash
Copier
Modifier
mysql -u root -p -h 127.0.0.1 -P 3306
Il te demandera : Enter password: → tu tapes : root

Ensuite, tape :

sql
Copier
Modifier
SHOW DATABASES;
USE authdb;
SHOW TABLES;
SELECT * FROM users;
📌 B. Avec un outil graphique
Tu peux utiliser DBeaver ou MySQL Workbench.

Configuration de connexion :

Host : 127.0.0.1

Port : 3307

Utilisateur : root

Mot de passe : root

Base de données : authdb (optionnel)

🚨 4. Si le port 3306 est déjà utilisé
Quand Docker refuse de démarrer MySQL sur 3306, c’est souvent parce qu’un autre MySQL tourne déjà sur ton système (par exemple installé via XAMPP, WAMP, MySQL Installer...).

✅ Solution :
Arrêter le service MySQL local

Appuie sur Win + R, tape services, puis Entrée

Cherche MySQL

Clique droit > Arrêter

Relancer Docker

bash
Copier
Modifier
docker-compose down
docker-compose up -d
Vérifier que le port est libre

Si tu veux voir ce qui utilise le port 3306 :

bash
Copier
Modifier
netstat -aon | findstr :3306 ou 07
Puis pour identifier le programme :

bash
Copier
Modifier
tasklist /FI "PID eq <numéro_PID>"
🔁 5. Exporter / Importer la base
Exporter la base depuis le conteneur :
bash
Copier
Modifier
docker exec mysql-auth \
  sh -c 'exec mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" authdb' > dump.sql
Importer en local :
bash
Copier
Modifier
mysql -u root -p authdb < dump.sql
🧪 6. Tests avec Jest
Les tests unitaires avec jest fonctionnent grâce à des mocks de Sequelize (User.findOne, User.create, etc).
Donc aucune vraie donnée n’est insérée en base durant les tests.

🧠 Résumé rapide (pense-bête)
Action	Commande ou chemin rapide
Voir les bases Docker	mysql -u root -p -h 127.0.0.1 -P 3307
Ouvrir interface graphique	DBeaver / MySQL Workbench
Docker UP	docker-compose up -d
Docker DOWN	docker-compose down
Port 3306 occupé ?	`netstat -aon
Arrêter MySQL local	services.msc → chercher MySQL
Exporter DB Docker	mysqldump ... > dump.sql
Importer DB local	mysql -u root -p authdb < dump.sql

✅ Tu es prêt
Maintenant que tout est bien configuré et documenté, tu pourras revenir ici la prochaine fois sans galérer 😄
```
