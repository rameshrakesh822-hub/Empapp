
pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/YOUR_USERNAME/Employee-app.git'
            }
        }

        stage('Build and Deploy') {
            steps {
                sh '''
                    test -f .env || {
                        echo "ERROR: .env file missing"
                        exit 1
                    }

                    docker compose config -q
                    docker compose up -d --build
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    docker compose ps
                    sleep 10
                    curl -f http://localhost/api/health
                '''
            }
        }
    }

    post {
        success {
            echo 'Employee Management System deployed successfully!'
        }

        failure {
            echo 'Deployment failed. Check Jenkins console output.'
        }
    }
}
