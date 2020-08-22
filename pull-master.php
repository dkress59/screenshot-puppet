<?php
echo "<h1>PIPELINE</h1><br />\n";

echo `cd /var/www/screenshot-puppet && git fetch --all && git checkout --force "origin/master" && npm install && killall -9 node && node index.js &`;

//echo `killall -9 node`;
echo "<br />
	node.js killed.<br />\n";

//echo `git fetch --all`;
//echo `git checkout --force "origin/master"`;
echo "<br />
	git repo pulled.<br />\n";

//echo `npm install`;
//echo `npm i puppeteer --unsafe-perm=true`;
echo "<br />
	npm packages updated.<br />\n";

//echo `node index.js &`;
echo "<br />
	node.js restarted.<br />\n";
