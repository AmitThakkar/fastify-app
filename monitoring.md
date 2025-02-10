# Monitoring

As we are containerizing our application and deploying on Kubernetes:

## Metrics Tracking 
* We can have Prometheus Scrape to scrape all the metrics
* Deploy Grafana
* Import Prometheus as a data source in the Grafana

## Logging
* We can install Loki/Clickhouse or send logs to splunk 
* Visualize logs in Grafana.

## Retry Logic
* Temporal support retry out of the box