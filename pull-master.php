<?php
exec('cd /var/www/screenshot-puppet');
echo "<h1>PIPELINE</h1><br />\n";

exec('killall -9 node');
echo "<br />
	node.js killed.<br />\n";

exec('git fetch --all');
exec('git checkout --force "origin/master"');
echo "<br />
	git repo pulled.<br />\n";

exec('npm install');
exec('npm i puppeteer --unsafe-perm=true');
echo "<br />
	npm packages updated.<br />\n";

exec('node index.js &');
echo "<br />
	node.js restarted.<br />\n";
