#!/bin/bash

BABEL="babeljs --minified --compact=true --no-comments"

#
# combine and minify using the babel compiler
#

D=src
$BABEL $D/secUtils.js $D/widget.js $D/server.js $D/uiSupport.js $D/keysetup.js $D/statusInfo.js $D/wifisetup.js $D/aprssetup.js $D/digisetup.js $D/trklogsetup.js $D/application.js > arcticsetup-min.js

#
# combine and minify css
#
cd style
cat widget.css style.css | cleancss -o style-min.css

cd ..
