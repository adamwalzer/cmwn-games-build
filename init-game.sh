#!/usr/local/bin/bash
gamefolder="game-$1"

mkdir library/$gamefolder
cp -r game-template/ library/$gamefolder/
cd library/$gamefolder
bash bin/install.sh
cd ../../
