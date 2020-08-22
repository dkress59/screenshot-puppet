<?php
echo "<h1>PIPELINE</h1><br />\n";

`killall -9 node`;
echo "node.js killed.<br />\n";

`git pull`;
echo "git repo pulled.<br />\n";

`npm install`;
`npm i puppeteer --unsafe-perm=true`;
echo "npm packages updated.<br />\n";

`node index.js &`;
echo "node.js restarted.<br />\n";
