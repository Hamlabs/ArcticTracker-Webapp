/* 
 Copyright (C) 2022-2024
 Øyvind Hanssen, LA7ECA, ohanssen@acm.org
 
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

pol.core.trklogSetup = class extends pol.core.Widget {

    constructor() {
        super();
        const t = this;
        t.classname = "core.trklogSetup"; 
        t.data = {trklog_on:false, trkpost_on:false, url: m.stream(""),  key: m.stream(""), 
                  interv: m.stream(""), ttl: m.stream("")}; 
        t.dirty = false;  
        t.keys = pol.widget.get("core.keySetup");
        
        this.widget = {
            view: function() {
                return m("div#trklog", [       
                    m("h1", "Track logging configuration"),
                    (t.errmsg != null ? m("div#errmsg", t.errmsg) : null),
                    m("form.digi", [  
                        m("div.field", 
                            m("span.leftlab", {class: "subsect"}, "Track logging: "),  
                            m(checkBox, {checked: t.data.trklog_on, onclick: toggle("trklog_on") }, "Activate")), 
                        m("div.field", 
                            m("span.leftlab", "Save interval: "),  
                            m(textInput, {value: t.data.interv, size: 3, maxLength:4, onchange: dirty, regex: /^[0-9\-]+$/i }), 
                                nbsp, "(seconds)" ),
                        m("div.field", 
                            m("span.leftlab", "Time to live: "),  
                            m(textInput, {value: t.data.ttl, size: 3, maxLength:4,  onchange: dirty, regex: /^[0-9\-]+$/i }), 
                                nbsp, "(days)" ), br,
                      
                        m("div.field", 
                            m("span.leftlab", {class: "subsect"}, "Auto upload: "),  
                            m(checkBox, {checked: t.data.trkpost_on, onclick: toggle("trkpost_on") }, "Activate")), 
                        m("div.field", 
                            m("span.leftlab", "Server URL: "),  
                            m(textInput, {id: "tlsrv", value: t.data.url, size: 31, maxLength:64,  onchange: dirty, regex: /^[a-zA-Z0-9\-\.\:\/]+$/i })),
                        m("div.field", 
                            m("span.leftlab", "Server key: "),  
                            m(textInput, {id: "tlkey", value: t.data.key, size: 31, maxLength:128,  onchange: dirty, regex: /^.*$/i })),
                      
                        m("div.butt", 
                            m("img.upd", {src: (t.dirty ? "img/warn.png" : "img/ok.png")}),
                            m("button", { type: "button", onclick: update}, "Update"),
                            m("button", { type: "button", onclick: reset}, "Reset"),

                        )
                      
                    ])
                ])
            }
        };
            
        
        
        function dirty() {
            t.dirty = true;
        }
        
        
        function toggle(x) {
            return ()=> {
                t.dirty=true; 
                t.data[x] = (t.data[x] ? false : true); 
                m.redraw();
            }
        } 
        
        
        function reset() {
            t.getInfo();
        }
        
        
        function toNumber(obj, x) {
            obj[x] = Number(obj[x]());
        }
        
            
        function update() {
            var obj = Object.assign({}, t.data); 
            toNumber(obj, "interv"); toNumber(obj, "ttl"); 

            t.keys.getSelectedSrv().PUT( "api/trklog", JSON.stringify(obj),
                ()=> { 
                    t.dirty = false; 
                    t.clearerr(); 
                }, 
                x=> { 
                    t.error("Update error (see browser log)", x);
                }
            );
        }
    }    
        

        
    getInfo() {
        this.keys.getSelectedSrv().GET( "api/trklog", null, 
            st => {
              //  const st = JSON.parse(x);
                this.data = st;
                this.data.url = m.stream(st.url);
                this.data.key = m.stream(""+st.key);
                this.data.interv = m.stream(st.interv);
                this.data.ttl = m.stream(st.ttl);
                this.dirty = false
                this.clearerr();
            }, 
            x=> { 
                this.error("Cannot GET data (se browser log)", x);
            }
        );
    }
        
    
    
    onActivate() {
        this.getInfo();
    }
    
} /* class */




pol.widget.setFactory( "core.trklogSetup", {
        create: () => new pol.core.trklogSetup()
    });



