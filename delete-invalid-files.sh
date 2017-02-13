#!/usr/local/bin/bash
for file in ./build/**/* ./build/**/**/* ./build/**/**/**/* ./build/**/**/**/**/*; do
  pat=([^A-Za-z0-9\/\._\\\-])
  # pat="^.*[^A-Za-z0-9\/\._\\\-]+.*$"
  if [[ $file =~ $pat ]]; then
    echo $file
    rm -fr "$file"
  fi
done
