<?php
exec('cd /var/www/screenshot-puppet', $out);
exec('git fetch --all', $out);
exec('git checkout --force "origin/master"', $out);
print_r($out);
