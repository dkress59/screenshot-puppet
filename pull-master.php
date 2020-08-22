<?php
echo "<h1>PIPELINE</h1><br />\n";

shell_exec('killall -9 node');
echo "node.js killed.<br />\n";

shell_exec('git pull');
echo "git repo pulled.<br />\n";

shell_exec('npm install');
shell_exec('npm i puppeteer --unsafe-perm=true');
echo "npm packages updated.<br />\n";

shell_exec('node index.js &');
echo "node.js restarted.<br />\n";
