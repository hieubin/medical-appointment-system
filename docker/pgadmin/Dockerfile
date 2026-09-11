FROM dpage/pgadmin4:8

USER root
COPY servers.json /pgadmin4/servers.json
COPY entrypoint-wrap.sh /entrypoint-wrap.sh
RUN chmod 644 /pgadmin4/servers.json && chmod +x /entrypoint-wrap.sh

ENTRYPOINT ["/entrypoint-wrap.sh"]
