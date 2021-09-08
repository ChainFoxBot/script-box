#!/bin/bash

# Stop Process

id=$(<pid.txt)
echo "id: $id"
if [[  "$id" =~ ^[0-9]+$ ]]
then
    echo "Stopping Java Program: pid= $id....."
    kill -9 $id
else
    echo "No pid specified  !!!"
fi

# clear
rm pid.txt

# run process
PACKAGENAME=`ls *[^sources].jar`
echo "Java Program: $PACKAGENAME is starting...."
nohup java -Dfile.encoding=utf-8 -jar ${PACKAGENAME} > log.file 2>&1 &
echo "$!" >> pid.txt
echo "Program successfully run on PID: $!"


