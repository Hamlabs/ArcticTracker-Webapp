// Entry point for Webpack build
// This file imports all source files in the correct order

import './secUtils.js';
import './widget.js';
import './server.js';
import './uiSupport.js';
import './keysetup.js';
import './statusInfo.js';
import './wifisetup.js';
import './aprssetup.js';
import './digisetup.js';
import './trklogsetup.js';

// The source files define pol and CONFIG but they're in module scope,
// not global scope when bundled by Webpack. We need to expose them globally
// for application.js to use them. However, since the modules use 'var pol = pol || {}',
// they won't be accessible from this module either.

