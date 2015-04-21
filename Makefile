restart:
  source ~/.nvm/nvm.sh; \
  nvm use 0.10; \
  pm2 stop warcluster-staging; \
  git pull origin master; \
  pm2 start warcluster-site/warcluster-staging.js