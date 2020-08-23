<?php
exec('cd /var/www/screenshot-puppet', $out);
exec('git    ALL = (www-data) /usr/bin/git fetch --all', $out);
exec('git    ALL = (www-data) /usr/bin/git checkout --force "origin/master"', $out);
print_r($out);
