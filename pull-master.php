<?php
exec('git    ALL = (www-data) /usr/bin/git pull', $out);
print_r($out);
