<?
exec('killall node');
echo "node.js killed.\n";
exec('git pull');
echo "git repo pulled.\n";
exec('npm install');
echo "npm packages updated.\n";
exec('node index.js &');
echo "node.js restarted.\n";
?>