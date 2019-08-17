echo "Starting deployment"
echo "  Building..."
tsc

echo "  Deploying archive"
scp -r build/ pi@192.168.178.25:/home/pi/services/cheryl-server-ts/
scp -r config/ pi@192.168.178.25:/home/pi/services/cheryl-server-ts/build/

