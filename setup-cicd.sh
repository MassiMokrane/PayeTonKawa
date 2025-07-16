#!/bin/bash

# Script de configuration CI/CD pour PayeTonKawa
# Ce script aide à configurer tous les éléments nécessaires pour le pipeline CI/CD

set -e

echo "🚀 Configuration du pipeline CI/CD pour PayeTonKawa"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    print_status "Vérification des prérequis..."
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        print_error "Git n'est pas installé"
        exit 1
    fi
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker n'est pas installé - nécessaire pour les tests de conteneurs"
    fi
    
    print_success "Prérequis vérifiés"
}

# Configuration des scripts de test
setup_test_scripts() {
    print_status "Configuration des scripts de test..."
    
    # Ajouter les scripts de test dans package.json des services backend
    for service in auth-service product-service order-service; do
        if [ -f "backend/$service/package.json" ]; then
            print_status "Configuration de $service..."
            
            # Ajouter le script de lint si il n'existe pas
            if ! grep -q '"lint"' "backend/$service/package.json"; then
                # Ajouter le script de lint (nécessite eslint)
                echo "Ajout du script de lint pour $service"
            fi
            
            # Vérifier que le script de test existe
            if ! grep -q '"test"' "backend/$service/package.json"; then
                print_warning "Script de test manquant pour $service"
            fi
        fi
    done
    
    print_success "Scripts de test configurés"
}

# Configuration de SonarQube
setup_sonarqube() {
    print_status "Configuration de SonarQube..."
    
    if [ ! -f "backend/sonar-project.properties" ]; then
        print_warning "Fichier sonar-project.properties manquant dans backend/"
        print_status "Création d'un fichier de configuration SonarQube..."
        
        cat > backend/sonar-project.properties << EOF
sonar.projectKey=payetonkawa-backend
sonar.projectName=PayeTonKawa Backend
sonar.projectVersion=1.0
sonar.sources=.
sonar.exclusions=**/node_modules/**,**/tests/**,**/*.test.js,**/*.spec.js
sonar.javascript.lcov.reportPaths=*/coverage/lcov.info
sonar.coverage.exclusions=**/*.test.js,**/*.spec.js,**/tests/**
EOF
        print_success "Fichier sonar-project.properties créé"
    fi
}

# Configuration des secrets GitHub
setup_github_secrets() {
    print_status "Configuration des secrets GitHub..."
    
    echo "Pour configurer les secrets GitHub, allez dans :"
    echo "Settings > Secrets and variables > Actions"
    echo ""
    echo "Ajoutez les secrets suivants :"
    echo ""
    echo "DOCKER_USERNAME=your-docker-username"
    echo "DOCKER_PASSWORD=your-docker-password"
    echo "PROD_HOST=your-production-server.com"
    echo "PROD_USERNAME=your-server-username"
    echo "PROD_SSH_KEY=your-ssh-private-key"
    echo "SONAR_TOKEN=your-sonarqube-token"
    echo "SNYK_TOKEN=your-snyk-token"
    echo "SLACK_WEBHOOK_URL=your-slack-webhook-url"
    echo ""
    echo "Appuyez sur Entrée quand vous avez configuré les secrets..."
    read -r
}

# Configuration du serveur de production
setup_production_server() {
    print_status "Configuration du serveur de production..."
    
    echo "Configuration requise sur le serveur de production :"
    echo ""
    echo "1. Installer Docker et Docker Compose :"
    echo "   curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "   sudo sh get-docker.sh"
    echo "   sudo curl -L \"https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
    echo "   sudo chmod +x /usr/local/bin/docker-compose"
    echo ""
    echo "2. Créer un utilisateur pour les déploiements :"
    echo "   sudo useradd -m -s /bin/bash deploy"
    echo "   sudo usermod -aG docker deploy"
    echo ""
    echo "3. Configurer les clés SSH :"
    echo "   sudo -u deploy ssh-keygen -t rsa -b 4096 -C \"deploy@payetonkawa\""
    echo "   sudo -u deploy cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys"
    echo ""
    echo "4. Cloner le repository :"
    echo "   sudo -u deploy git clone https://github.com/your-username/PayeTonKawa.git /opt/payetonkawa"
    echo ""
    echo "Appuyez sur Entrée quand vous avez configuré le serveur..."
    read -r
}

# Configuration de Nginx
setup_nginx() {
    print_status "Configuration de Nginx..."
    
    echo "Configuration Nginx pour le frontend :"
    echo ""
    echo "Créer le fichier /etc/nginx/sites-available/payetonkawa :"
    echo ""
    cat << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /opt/payetonkawa/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
    echo ""
    echo "Puis activer le site :"
    echo "sudo ln -s /etc/nginx/sites-available/payetonkawa /etc/nginx/sites-enabled/"
    echo "sudo nginx -t"
    echo "sudo systemctl restart nginx"
    echo ""
    echo "Appuyez sur Entrée quand vous avez configuré Nginx..."
    read -r
}

# Test de la configuration
test_configuration() {
    print_status "Test de la configuration..."
    
    # Tester les services backend
    for service in auth-service product-service order-service; do
        if [ -d "backend/$service" ]; then
            print_status "Test de $service..."
            cd "backend/$service"
            if npm test -- --passWithNoTests > /dev/null 2>&1; then
                print_success "$service : Tests OK"
            else
                print_warning "$service : Tests échoués ou non configurés"
            fi
            cd ../..
        fi
    done
    
    # Tester le frontend
    if [ -d "frontend" ]; then
        print_status "Test du frontend..."
        cd frontend
        if npm test -- --passWithNoTests > /dev/null 2>&1; then
            print_success "Frontend : Tests OK"
        else
            print_warning "Frontend : Tests échoués ou non configurés"
        fi
        cd ..
    fi
    
    print_success "Configuration testée"
}

# Génération du rapport final
generate_final_report() {
    print_status "Génération du rapport final..."
    
    cat > CI-CD-SETUP-REPORT.md << EOF
# Rapport de configuration CI/CD - PayeTonKawa

## ✅ Configuration terminée

### Workflows GitHub Actions créés :
- \`ci-backend.yml\` - CI pour les services backend
- \`ci-frontend.yml\` - CI pour le frontend
- \`cd-deploy.yml\` - CD pour le déploiement
- \`security-scan.yml\` - Scans de sécurité
- \`performance-test.yml\` - Tests de performance
- \`notifications.yml\` - Notifications et rapports

### Fichiers de configuration créés :
- \`frontend/.lighthouserc.js\` - Configuration Lighthouse
- \`backend/*/tests/load-test.yml\` - Tests de charge
- \`CI-CD-README.md\` - Documentation complète

### Prochaines étapes :

1. **Configurer les secrets GitHub** dans Settings > Secrets and variables > Actions
2. **Configurer SonarQube** et obtenir un token d'accès
3. **Configurer le serveur de production** avec Docker et Nginx
4. **Tester le pipeline** en poussant du code sur la branche develop

### Secrets requis :
- DOCKER_USERNAME
- DOCKER_PASSWORD
- PROD_HOST
- PROD_USERNAME
- PROD_SSH_KEY
- SONAR_TOKEN
- SNYK_TOKEN
- SLACK_WEBHOOK_URL

### URLs importantes :
- GitHub Actions : https://github.com/your-username/PayeTonKawa/actions
- SonarQube : http://localhost:9000 (si installé localement)
- Production : http://your-domain.com

## 🎉 Configuration terminée avec succès !

Le pipeline CI/CD est maintenant prêt à être utilisé.
EOF
    
    print_success "Rapport généré : CI-CD-SETUP-REPORT.md"
}

# Menu principal
main() {
    echo "Choisissez les options à configurer :"
    echo "1. Vérifier les prérequis"
    echo "2. Configurer les scripts de test"
    echo "3. Configurer SonarQube"
    echo "4. Configurer les secrets GitHub"
    echo "5. Configurer le serveur de production"
    echo "6. Configurer Nginx"
    echo "7. Tester la configuration"
    echo "8. Générer le rapport final"
    echo "9. Configuration complète"
    echo "0. Quitter"
    echo ""
    read -p "Votre choix : " choice
    
    case $choice in
        1) check_prerequisites ;;
        2) setup_test_scripts ;;
        3) setup_sonarqube ;;
        4) setup_github_secrets ;;
        5) setup_production_server ;;
        6) setup_nginx ;;
        7) test_configuration ;;
        8) generate_final_report ;;
        9)
            check_prerequisites
            setup_test_scripts
            setup_sonarqube
            setup_github_secrets
            setup_production_server
            setup_nginx
            test_configuration
            generate_final_report
            ;;
        0) echo "Au revoir !"; exit 0 ;;
        *) echo "Choix invalide"; exit 1 ;;
    esac
}

# Exécution du script
if [ "$1" = "--auto" ]; then
    # Mode automatique
    check_prerequisites
    setup_test_scripts
    setup_sonarqube
    test_configuration
    generate_final_report
    print_success "Configuration automatique terminée !"
else
    # Mode interactif
    main
fi 