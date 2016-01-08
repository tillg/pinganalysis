#!/bin/bash

# wait some seconds to auto-connect to Internet
sleep 30

# name of the logfile
DATE=$(date +"%Y-%m-%d")

# name of directory
# http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
DIR="$( cd "$( dirname "$0" )" && pwd )"

# timestamp of start
TIMESTAMP=$(date +"%s")
#echo "TIMESTAMP" $TIMESTAMP >> $DIR/logs/$DATE.txt
echo "TIMESTAMP" $TIMESTAMP >> $DIR/$DATE.txt


# -i 5 intervall 5 sec (not available in Windows)
# -D print timestamp (not available in Windows)
# -W 5 seconds to wait for response
#ping www.google.de -i 5 -D -W 5 >> $DIR/logs/$DATE.txt
ping -i 5 mgm-tp.com | while read pong; do echo "$(date): $pong"; done >> $DIR/$DATE.txt

# size of daily file:
#  about 100 characters=bytes per line at 86400 sec/day
#  interval of 5 sec -> 17280 entries
#  = 1.728.000 bytes per file (about max. 1.7 MB/file/day)
#  interval of 10 sec -> 8640 entries
#  = 864.000 bytes per file (about max. 0.9 MB/file/day)

