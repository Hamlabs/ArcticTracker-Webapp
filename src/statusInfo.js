/*
 Map browser based on OpenLayers 5. 
 Misc. generic application stuff. 
 
 Copyright (C) 2017-2019 Øyvind Hanssen, LA7ECA, ohanssen@acm.org
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published 
 by the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program. If not, see <http://www.gnu.org/licenses/>.
*/




/**
 * Reference search (in a popup window). 
 */

pol.core.statusInfo = class extends pol.core.Widget {

    constructor() {
        super();
        const t = this;
        t.classname = "core.statusInfo"; 
        t.data = {heap:0, flash:0, ap:"-", ipaddr:"-", macaddr: "-",  mdns: "-", vbatt: "-"}; 
        
        this.widget = {
            view: function() {
                return m("div", [       
                    m("h1", "Status Info"),
                    m("form.status", [  
                        m("div.field", 
                            m("span.leftlab", "Free heap: "), toKbytes(t.data.heap)), 
                        m("div.field", 
                            m("span.leftlab", "Flash size: "), toKbytes(t.data.flash)), 
                        m("div.field", 
                            m("span.leftlab", "Connected AP: "), t.data.ap ),
                        m("div.field", 
                            m("span.leftlab", "IP address: "), t.data.ipaddr ),
                        m("div.field", 
                            m("span.leftlab", "mDNS hostname: "), t.data.mdns ),    
                       m("div.field", 
                            m("span.leftlab", "Soft AP: "), (t.data.softap ? "Enabled" : "Disabled") ),    
                        m("div.field", 
                            m("span.leftlab", "MAC address: "), t.data.macaddr ),   
                        m("div.field", 
                            m("span.leftlab", "Battery voltage: "), t.data.vbatt + " V" ), 
                        m("div.field", 
                            m("span.leftlab", "Battery status: "), t.data.battstatus ), 
                        m("span.errmsg", t.errmsg),
                    ])
                ])
            }
        };
    
        setInterval(()=>t.getInfo(), 30000);
        
        
        function toKbytes(x) {
            return Math.round(x / 100)/10 + " kB"; 
        }
        
    }    
        
        
    getInfo() {
        server.GET( "api/info", null, 
            st => {
                this.data = st;
                pol.widget.get("core.keySetup").setAuth(-1, true, false)
                this.clearerr();
            },            
            x=> { 
                pol.widget.get("core.keySetup").setAuth(-1, false, (x.status != null && x.status==401))
                this.error("Cannot GET data (se browser log)", x);
            }
        );
    }
    
} /* class */




pol.widget.setFactory( "core.statusInfo", {
        create: () => new pol.core.statusInfo()
    });



