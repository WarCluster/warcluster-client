restart:
	forever stop /home/owl/warcluster-site/warcluster-staging.js
	git pull origin master
	forever start /home/owl/warcluster-site/warcluster-staging.js
