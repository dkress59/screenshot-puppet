<?
exec('killall node');
exec('git pull');
exec('npm install');
exec('PORT=4848 node index.js &');
?>