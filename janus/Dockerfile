# Use the SaverOps Janus Gateway image as base
FROM saverops/janus-gateway:0.10.7

# Copy the custom streaming plugin config into the container
COPY ./etc/janus/janus.plugin.streaming.jcfg /opt/janus/etc/janus/janus.plugin.streaming.jcfg

# Expose the Janus ports
# Admin HTTP port
EXPOSE 7088
# HTTP API
EXPOSE 8088
# WebSocket API
EXPOSE 8188
# RTP media streams
EXPOSE 10000-10200/udp

# Entrypoint and command are inherited from the base image