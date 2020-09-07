cd /var/www/screenshot-puppet
/usr/bin/git checkout -- .
/usr/bin/git pull origin master
npm install pkg.json
tsc
pm2 reload ecosystem.config.js
