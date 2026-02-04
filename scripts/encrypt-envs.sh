#!/bin/bash
for f in $(find . -name ".env"); do
  gpg --encrypt --recipient antonis.zisis.dev@gmail.com --output "$f.gpg" "$f"
done
