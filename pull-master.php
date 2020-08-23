<?php
exec('cd /var/www/screenshot-puppet && git pull', $output);
echo "<h1>PIPELINE</h1><br />\n";
print_r($output);
echo "<br />\n";
unset($output);
