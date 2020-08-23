<?php
echo "newer exec test<br />\n";

if (function_exists('exec')) {
	echo "exec is enabled<br />\n";
} else {
	echo "exec is disabled<br />\n";
}
if (function_exists('shell_exec')) {
	echo "shell_exec is enabled<br />\n";
} else {
	echo "shell_exec is disabled<br />\n";
}

echo `whoami\n`;
exec('whoami', $output);
print_r($output);
