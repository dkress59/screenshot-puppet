<?
exec('killall node');
exec('npm install');
exec('PORT=4848 node index.js &');
?>