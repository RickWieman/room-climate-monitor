# Room Climate Monitor

Simple [meteor](https://www.meteor.com) application for **monitoring** temperature and humidity in a room. Gathering the measurements themselves is done using a separate Python script, see [Gathering data](#gathering-data).

## Setup

You only need a server with node.js, npm and mongodb for deploying this application.
Refer to [this article](https://www.digitalocean.com/community/tutorials/how-to-deploy-a-meteor-js-application-on-ubuntu-14-04-with-nginx) for a rather detailed tutorial on how to do this.

I run this application on a Raspberry Pi Zero with Arch Linux. You could create a simple start script, such as the one below, and create a systemd service that runs this script for you. The script is based on the README file inside the `bundle` directory:

```bash
#!/bin/bash

export MONGO_URL='mongodb://localhost:27017/<database>'
export ROOT_URL='http://<as-desired>'
export PORT=80

cd /your/path/to/bundle
node main.js
```

## Deployment

Simply run `meteor build .` on your development machine and upload the resulting tar-ball to your server. Expand the tar-ball there, and run the following script (for example):

```bash
#!/bin/bash

BASE_DIR=/your/home/directory/
DEFAULT_USER=your-username
SERVICE_NAME=climate-monitor

if [[ $UID != 0 ]]; then
	echo "This deployment script requires sudo rights for systemctl."
	exit 1
fi

# Stop the server
systemctl stop ${SERVICE_NAME}

# Remove existing files
rm -rf ${BASE_DIR}bundle/

# Extract the new package (as default user)
sudo -u ${DEFAULT_USER} tar xfz room-climate-monitor.tar.gz -C ${BASE_DIR}

# In case you have any npm build issues, you may want to comment out the following lines (dirty fix):
## Fix package conflicts (we want fibers 1.0.8 for build purposes)
#cd ${BASE_DIR}bundle/programs/server
#sed -i 's/1\.0\.5/1.0.8/g' npm-shrinkwrap.json
#sed -i 's/\"fibers\"\: \"1\.0\.5\"/"fibers": "1.0.8"/g' package.json

# Install npm packages (as default user)
sudo -u ${DEFAULT_USER} npm install

# Start the server again
systemctl start ${SERVICE_NAME}
```

## Gathering data

Just booting this system won't give you any data, it is merely a (simple) visualisation of a MongoDB collection. I use an [AM2302](http://akizukidenshi.com/download/ds/aosong/AM2302.pdf) sensor wired to the GPIO pins of the Pi, together with the [Adafruit DHT library](https://github.com/adafruit/Adafruit_Python_DHT) to insert measurements directly into the MongoDB collection (using `pymongo`).

The data format used is straight-forward, namely a document with three fields: `ts` containing the timestamp (as integer, in milliseconds), `temperature` containing the measured temperature (as float, or integer as desired) and `humidity` containing the measured humidity (as float, or integer as desired).
