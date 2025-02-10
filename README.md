# Climate X
This project was bootstrapped with Fastify-CLI.

## Install dependencies
`npm install`

## Available Scripts

In the project directory, you can run:

### Start Dev Mode
`npm run dev`
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Start In Production Mode
`npm run buildstart`
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Run Test Cases
`npm run test`

## Docker

### Build Docker Image 
`docker build --no-cache -t climate-x .`

### Run Docker Container
`docker run -p 3000:3000 climate-x`

## Deploy

### Start Minikube
In case it's not install follow the instruction to install first https://minikube.sigs.k8s.io/docs/start/
`minikube start`

### Use Minikube's Docker daemon
`eval $(minikube docker-env)`

### Deploy Via Kubectl
`kubectl apply -f deployments/main.yaml`

### Deploy Via Terraform Resources
`terraform init`
`terraform apply --auto`

> In case of ImagePullBackOff error, load the image into Minikube manually: `minikube cache add climate-x:latest`

### Test Deployment
Create tunnel between local machine and k8s-service:
`kubectl port-forward --namespace climate-x service/climate-x 3000:80`

