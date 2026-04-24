# Guide de Déploiement IUSJ Planner sur AWS EC2

## Prérequis

- Instance EC2 `t3.micro` dans VPC `iusj-planner-vpc`
- Subnet public avec route vers Internet Gateway
- Security Group avec règles :
  - SSH (22) depuis votre IP
  - HTTP (80) depuis 0.0.0.0/0
  - HTTPS (443) depuis 0.0.0.0/0
  - Port 8080 (Gateway) depuis 0.0.0.0/0

## Étapes de Déploiement

### 1. Connexion à l'instance EC2

```bash
# Via EC2 Instance Connect (depuis AWS Console)
# Ou via SSH
ssh -i "iusj-planner-key.pem" ubuntu@<EC2_PUBLIC_IP>
```

### 2. Installation des dépendances

```bash
# Mettre à jour les packages
sudo apt update
sudo apt upgrade -y

# Installer Docker
sudo apt install -y docker.io

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Ajouter l'utilisateur ubuntu au groupe docker
sudo usermod -aG docker ubuntu

# Vérifier l'installation
docker --version
docker-compose --version
```

### 3. Cloner le repository

```bash
# Cloner depuis GitHub
git clone -b main https://github.com/iusjc-planner/iusjc-planner.git
cd iusjc-planner
```

### 4. Configurer les variables d'environnement

```bash
# Le fichier .env est déjà configuré pour EC2
# Vérifier que les valeurs sont correctes
cat .env
```

### 5. Démarrer les services

```bash
# Construire et démarrer tous les services
docker-compose up -d --build

# Attendre que les services soient prêts (environ 2-3 minutes)
sleep 30

# Vérifier le statut des services
docker-compose ps

# Vérifier les logs
docker-compose logs -f
```

### 6. Vérifier l'accès

```bash
# Frontend (port 80)
curl http://localhost/

# Gateway (port 8080)
curl http://localhost:8080/actuator/health

# Eureka (port 8761)
curl http://localhost:8761/
```

## Accès à l'application

- **Frontend** : `http://<EC2_PUBLIC_IP>`
- **Gateway** : `http://<EC2_PUBLIC_IP>:8080`
- **Eureka** : `http://<EC2_PUBLIC_IP>:8761`

## Gestion des services

### Arrêter les services

```bash
docker-compose down
```

### Redémarrer les services

```bash
docker-compose restart
```

### Voir les logs

```bash
# Tous les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f gateway
docker-compose logs -f auth-service
```

### Mettre à jour le code

```bash
# Récupérer les dernières modifications
git pull origin main

# Reconstruire et redémarrer
docker-compose up -d --build
```

## Dépannage

### Les services ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h
```

### La base de données ne se connecte pas

```bash
# Vérifier que MySQL est en cours d'exécution
docker-compose ps mysql

# Vérifier les logs MySQL
docker-compose logs mysql

# Redémarrer MySQL
docker-compose restart mysql
```

### Le frontend ne charge pas

```bash
# Vérifier que Nginx est en cours d'exécution
docker-compose ps frontend

# Vérifier les logs Nginx
docker-compose logs frontend

# Vérifier la configuration Nginx
docker exec iusj-frontend cat /etc/nginx/nginx.conf
```

## Maintenance

### Nettoyer les images et conteneurs inutilisés

```bash
docker system prune -a
```

### Sauvegarder la base de données

```bash
docker exec iusj-mysql mysqldump -u root -p${DB_PASSWORD} ${DB_NAME} > backup.sql
```

### Restaurer la base de données

```bash
docker exec -i iusj-mysql mysql -u root -p${DB_PASSWORD} ${DB_NAME} < backup.sql
```

## Coûts AWS

- **EC2 t3.micro** : ~$0.0104/heure (eligible free tier)
- **Stockage EBS** : ~$0.10/Go/mois
- **Transfert de données** : Gratuit (entrée), ~$0.09/Go (sortie)

**Estimation mensuelle** : ~$5-10 USD

## Support

Pour toute question ou problème, consultez :
- Documentation : `documentation/`
- Logs Docker : `docker-compose logs`
- GitHub Issues : https://github.com/iusjc-planner/iusjc-planner/issues
