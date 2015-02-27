#!/bin/bash

: ${SITES_AVAILABLE_HOME:=/etc/apache2/sites-available}
: ${SITES_ENABLED_HOME:=/etc/apache2/sites-enabled}

sudo rm -rf $SITES_ENABLED_HOME/vcerto
sudo rm -rf $SITES_ENABLED_HOME/agende
sudo rm -rf $SITES_ENABLED_HOME/agende-localhost

sudo ln -s $SITES_AVAILABLE_HOME/vcerto $SITES_ENABLED_HOME/vcerto

sudo service apache2 restart