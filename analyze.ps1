# Script PowerShell pour l'analyse SonarQube
# Remplace cette valeur par ton vrai token SonarQube
$SONAR_TOKEN = "sqa_4bda2ab8a0cab8b76c337f5be63747457042c843"
$SONAR_HOST_URL = "http://localhost:9000"

Write-Host "Début de l'analyse SonarQube..." -ForegroundColor Green

# Analyse backend
Write-Host "Analyse du backend..." -ForegroundColor Yellow
& "C:\Users\BEY\Desktop\sonar-scanner-5.0.1.3006-windows\bin\sonar-scanner.bat" "-Dsonar.projectKey=paye-ton-kawa-backend" "-Dsonar.sources=backend" "-Dsonar.host.url=$SONAR_HOST_URL" "-Dsonar.token=$SONAR_TOKEN"

Write-Host "Analyse backend terminée." -ForegroundColor Green

# Analyse frontend
Write-Host "Analyse du frontend..." -ForegroundColor Yellow
& "C:\Users\BEY\Desktop\sonar-scanner-5.0.1.3006-windows\bin\sonar-scanner.bat" "-Dsonar.projectKey=paye-ton-kawa-frontend" "-Dsonar.sources=frontend" "-Dsonar.host.url=$SONAR_HOST_URL" "-Dsonar.token=$SONAR_TOKEN"

Write-Host "Analyse frontend terminée." -ForegroundColor Green
Write-Host "Analyse complète terminée !" -ForegroundColor Green 