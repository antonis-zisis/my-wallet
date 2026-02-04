#!/bin/bash
for f in $(find . -name ".env.gpg"); do
  out="${f%.gpg}"
  gpg --decrypt --output "$out" "$f"
done
