require('shelljs/global');
exec('ssh -p 7022 owl@kiril.eu "make -C ~/warcluster-site restart"')