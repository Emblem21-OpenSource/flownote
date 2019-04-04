#[DOCKERFILE]
#-------------------------------------------------------------------
# Start Supervisor
#ENTRYPOINT ["supervisord", "-c", "/etc/supervisord.conf"]
 
#[SUPERVISORD.CONF]
#-------------------------------------------------------------------
#[supervisord]
#nodaemon=true
#pidfile=/var/run/supervisord.pid
#logfile=/var/log/supervisor/supervisord.log
 
#[program:cloud9]
#command = /root/flownote/entrypoint.js :
#directory = /flownote
#user = root
#autostart = true
#autorestart = true
#stdout_logfile = /var/log/supervisor/c9.log
#stderr_logfile = /var/log/supervisor/c9.err
#environment = NODE_ENV="production"