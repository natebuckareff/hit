#!/usr/bin/bash
export BASE_PATH="/hit"
pnpm build
touch .output/public/.nojekyll
cp .output/public/index.html .output/public/404.html
pnpm dlx gh-pages -d .output/public -b gh-pages --dotfiles