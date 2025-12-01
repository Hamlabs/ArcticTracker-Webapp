/*
 Copyright (C) 2022-2023 Øyvind Hanssen, LA7ECA, ohanssen@acm.org
 
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
        t.data = t.emptyData();
        t.keys = pol.widget.get("core.keySetup");
        
        this.widget = {
            view: function() {
                return m("div", [       
                    m("h1", "Status Info"),
                    (t.errmsg != null ? m("div#errmsg", t.errmsg) : null),
                    m("form.status", [  
                        m("div.field", 
                            m("span.leftlab", "Device: "), t.data.device),
                        m("div.field", 
                            m("span.leftlab", "Firmware version: "), t.data.version),
                        m("div.field", 
                            m("span.leftlab", "Free heap: "), toKbytes(t.data.heap)), 
                        m("div.field", 
                            m("span.leftlab", "Flash size: "), toKbytes(t.data.flash)), 
                      
                        m("div.field", 
                            m("span.leftlab", "Filesystem size: "), toKbytes(t.data.sizefs)), 
                        m("div.field", 
                            m("span.leftlab", "Filesyst. free space: "), toKbytes(t.data.freefs)), 
                      
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
                            m("span.leftlab", "Battery voltage: "), t.data.vbatt + " V  ("+t.data.vpercent+" %)" ), 
                        m("div.field", 
                            m("span.leftlab", "Battery status: "), t.data.battstatus ), br
                    ])
                ])
            }
        };
    
        
        
        function toKbytes(x) {
            return Math.round(x / 100)/10 + " kB"; 
        }
        
    }    
    
    
    emptyData() {
       return {heap:0, flash:0, ap:"-", ipaddr:"-", macaddr: "-",  mdns: "-", vbatt: "-", device: "-", version: "-"}; 
    }
    
    
        
    /* Get info from tracker */    
    getInfo() {
        this.clearerr();
        this.data = this.emptyData();
        this.spinner(true);
        this.keys.getSelectedSrv().GET( "api/info", null, 
            st => {
                this.data = st;
                pol.widget.get("core.keySetup").setAuth(-1, true, false)
                this.spinner(false);
                m.redraw();
            },            
            x=> { 
                pol.widget.get("core.keySetup").setAuth(-1, false, (x.status != null && x.status==401))
                this.error("Cannot GET data from tracker", x);
                this.spinner(false);
            }
        );
    }
    
    onActivate() {
        this.getInfo();
    }

} /* class */




pol.widget.setFactory( "core.statusInfo", {
        create: () => new pol.core.statusInfo()
    });



