terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.35.1"
    }
  }
}
provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = "minikube"
}

resource "kubernetes_namespace" "ns" {
  metadata {
    name = "climate-x"
  }
}

resource "kubernetes_deployment" "deploy" {
  metadata {
    name      = "climate-x"
    namespace = kubernetes_namespace.ns.metadata.0.name
    labels = {
      app = "climate-x"
    }
  }

  spec {
    replicas = 2
    selector {
      match_labels = {
        app = "climate-x"
      }
    }
    template {
      metadata {
        labels = {
          app = "climate-x"
        }
      }
      spec {
        container {
          name  = "climate-x"
          image = "climate-x:latest"
          image_pull_policy = "Never"
          port {
            container_port = 3000
          }
          env {
            name  = "NODE_ENV"
            value = "production"
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "svc" {
  metadata {
    name      = "climate-x"
    namespace = kubernetes_namespace.ns.metadata.0.name
  }
  spec {
    selector = {
      app = "climate-x"
    }
    port {
      port        = 80
      target_port = 3000
    }
  }
}
