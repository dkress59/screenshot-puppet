<?php
exec('cd /var/www/screenshot-puppet', $output);
echo "<h1>PIPELINE</h1><br />\n";
print_r($output);
echo "<br />\n";
unset($output);

exec('killall -9 node', $output);
echo "<br />
	node.js killed:<br />\n";
print_r($output);
echo "<br />\n";
unset($output);

exec('git pull', $output);
/* exec('git fetch --all', $output);
exec('git checkout --force "origin/master"', $output); */
echo "<br />
	git repo pulled:<br />\n";
print_r($output);
echo "<br />\n";
unset($output);

shell_exec('npm install', $output);
//exec('npm i puppeteer --unsafe-perm=true', $output);
echo "<br />
	npm packages updated:<br />\n";
print_r($output);
echo "<br />\n";
unset($output);

exec('node index.js &', $output);
echo "<br />
	node.js restarted:<br />\n";
print_r($output);
echo "<br />\n";
unset($output);
