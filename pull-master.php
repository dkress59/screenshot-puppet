<?php
echo "<h1>PIPELINE</h1><br />\n";

exec('killall -9 node');
echo "node.js killed.<br />\n";

exec('git pull');
echo "git repo pulled.<br />\n";

exec('npm install');
exec('npm i puppeteer --unsafe-perm=true');
echo "npm packages updated.<br />\n";

exec('node index.js &');
echo "node.js restarted.<br />\n";
