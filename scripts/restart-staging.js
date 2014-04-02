require('shelljs/global');
exec('ssh -p 7022 owl@kiril.eu "cd ~/warcluser-site; git pull origin master;forever restart /home/owl/warcluster-site/warcluster-staging.js"')

