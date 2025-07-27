#!/usr/bin/bash
export BASE_PATH="/hit/"
pnpm build
touch .output/public/.nojekyll
pnpm dlx gh-pages -d .output/public -b gh-pages --dotfiles