<?php
echo "PIPELINE\n";
exec('killall node');
echo "node.js killed.\n";
exec('git pull');
echo "git repo pulled.\n";
exec('npm install');
exec('npm i puppeteer --unsafe-perm=true');
echo "npm packages updated.\n";
exec('node index.js &');
echo "node.js restarted.\n";
