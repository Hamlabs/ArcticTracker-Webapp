#!/bin/bash

#
# Build JavaScript using Webpack
#
npm run build

#
# combine and minify css
#
cd style
cat widget.css style.css mobil.css | npx cleancss -o style-min.css

cd ..
