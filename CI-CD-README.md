# Pipeline CI/CD - PayeTonKawa

Ce document décrit le pipeline CI/CD complet mis en place pour le projet PayeTonKawa.

## 🚀 Vue d'ensemble

Le pipeline CI/CD est composé de plusieurs workflows GitHub Actions qui automatisent l'intégration continue, le déploiement continu, les tests de sécurité et les tests de performance.

## 📋 Workflows disponibles

### 1. CI Backend Services (`ci-backend.yml`)

**Déclencheurs :**
- Push sur `main` et `develop`
- Pull requests vers `main` et `develop`
- Modifications dans le dossier `backend/`

**Jobs :**
- **test-auth-service** : Tests unitaires et d'intégration pour le service d'authentification
- **test-product-service** : Tests unitaires et d'intégration pour le service de produits
- **test-order-service** : Tests unitaires et d'intégration pour le service de commandes
- **sonarqube-analysis** : Analyse de qualité du code avec SonarQube
- **build-docker-images** : Construction et push des images Docker (uniquement sur `main`)

### 2. CI Frontend (`ci-frontend.yml`)

**Déclencheurs :**
- Push sur `main` et `develop`
- Pull requests vers `main` et `develop`
- Modifications dans le dossier `frontend/`

**Jobs :**
- **test-frontend** : Tests unitaires et de couverture pour le frontend React
- **build-frontend** : Construction de l'application frontend
- **sonarqube-frontend** : Analyse de qualité du code frontend

### 3. CD Deploy to Production (`cd-deploy.yml`)

**Déclencheurs :**
- Push sur `main`
- Déclenchement manuel

**Jobs :**
- **deploy-backend** : Déploiement des services backend
- **deploy-frontend** : Déploiement du frontend
- **health-check** : Vérification de santé des services déployés
- **rollback** : Rollback automatique en cas d'échec

### 4. Security Scan (`security-scan.yml`)

**Déclencheurs :**
- Push sur `main` et `develop`
- Pull requests vers `main` et `develop`
- Planifié tous les lundis à 2h du matin

**Jobs :**
- **dependency-check** : Audit des dépendances npm
- **docker-security-scan** : Scan de sécurité des images Docker avec Trivy
- **codeql-analysis** : Analyse de sécurité du code avec CodeQL
- **container-scan** : Scan des conteneurs avec Snyk

### 5. Performance Tests (`performance-test.yml`)

**Déclencheurs :**
- Push sur `main` et `develop`
- Pull requests vers `main` et `develop`
- Planifié tous les dimanches à 3h du matin

**Jobs :**
- **load-test-backend** : Tests de charge des services backend avec Artillery
- **lighthouse-audit** : Audit de performance du frontend avec Lighthouse
- **api-performance-test** : Tests de performance des APIs
- **memory-leak-test** : Tests de fuites mémoire

### 6. Notifications and Reports (`notifications.yml`)

**Déclencheurs :**
- Fin d'exécution des autres workflows
- Planifié pour les rapports hebdomadaires

**Jobs :**
- **notify-slack** : Notifications Slack pour tous les workflows
- **generate-weekly-report** : Génération de rapports hebdomadaires
- **coverage-report** : Rapports de couverture de code

## 🔧 Configuration requise

### Secrets GitHub

Configurez les secrets suivants dans votre repository GitHub :

```bash
# Docker Hub
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password

# Production Server
PROD_HOST=your-production-server.com
PROD_USERNAME=your-server-username
PROD_SSH_KEY=your-ssh-private-key

# SonarQube
SONAR_TOKEN=your-sonarqube-token

# Snyk
SNYK_TOKEN=your-snyk-token

# Slack
SLACK_WEBHOOK_URL=your-slack-webhook-url
```

### Configuration SonarQube

1. Créez un projet dans SonarQube
2. Générez un token d'accès
3. Configurez le fichier `sonar-project.properties` dans le dossier `backend/`

### Configuration du serveur de production

1. Installez Docker et Docker Compose
2. Configurez Nginx pour servir le frontend
3. Créez un utilisateur dédié pour les déploiements
4. Configurez les clés SSH

## 📊 Métriques et rapports

### Couverture de code
- Objectif : 95% minimum
- Rapports générés automatiquement
- Upload vers Codecov
- Notifications Slack

### Qualité du code
- Analyse SonarQube automatique
- Seuils de qualité configurés
- Rapports détaillés

### Performance
- Tests de charge avec Artillery
- Audit Lighthouse pour le frontend
- Monitoring des temps de réponse

### Sécurité
- Scan automatique des dépendances
- Analyse de sécurité du code
- Scan des conteneurs Docker

## 🚨 Gestion des erreurs

### Rollback automatique
En cas d'échec du déploiement :
1. Arrêt automatique des services
2. Retour à la version précédente
3. Redémarrage des services
4. Notification d'échec

### Notifications
- Slack pour tous les événements importants
- Rapports hebdomadaires automatiques
- Alertes en cas d'échec

## 🔄 Workflow de développement

### Branche de développement
1. Créer une branche depuis `develop`
2. Développer et tester localement
3. Pousser vers la branche
4. Créer une Pull Request
5. Les tests CI s'exécutent automatiquement
6. Review et merge

### Déploiement en production
1. Merge vers `main`
2. Déclenchement automatique du CD
3. Construction des images Docker
4. Déploiement sur le serveur de production
5. Vérification de santé
6. Notification de succès/échec

## 📈 Monitoring et observabilité

### Métriques collectées
- Temps de réponse des APIs
- Utilisation des ressources
- Taux d'erreur
- Couverture de code
- Qualité du code

### Outils utilisés
- Prometheus pour les métriques
- Grafana pour la visualisation
- SonarQube pour la qualité
- Codecov pour la couverture

## 🛠️ Maintenance

### Mises à jour
- Mise à jour automatique des dépendances
- Scan de sécurité hebdomadaire
- Tests de performance réguliers

### Sauvegarde
- Sauvegarde automatique des données
- Rétention des artefacts de test
- Historique des déploiements

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs GitHub Actions
2. Consultez les rapports SonarQube
3. Contactez l'équipe DevOps

---

**Note :** Ce pipeline est conçu pour être robuste et automatisé. Tous les tests et vérifications sont exécutés automatiquement pour garantir la qualité et la sécurité du code déployé en production. 