#!/usr/bin/env bash

echo "[installer] Initializing Git"
git init
git remote add origin git@github.com:ginasink/${PWD##*/}.git
git add .
git commit -am "Initial Commit"
git push origin master
git checkout -b rc
git push origin rc

echo "[installer] Installing hooks"
bash $PWD/bin/install-git-hooks.sh

cat <<EOF
[installer] Completed!

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!                                                    !!
!!           You're all set and ready to go.          !!
!!                                                    !!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

Happy Coding!

EOF
