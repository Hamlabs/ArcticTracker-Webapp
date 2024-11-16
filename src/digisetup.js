/*
 Copyright (C) 2022-2024 Øyvind Hanssen, LA7ECA, ohanssen@acm.org
 
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

pol.core.digiSetup = class extends pol.core.Widget {

    constructor() {
        super();
        const t = this;
        t.classname = "core.digiSetup"; 
        t.data = {digiOn:false, wide1:false, sar:false, igateOn:false, server: m.stream(""),  port: m.stream(""), user: m.stream(""), passcode: m.stream("")}; 
        t.dirty = false;   
        t.keys = pol.widget.get("core.keySetup");
                
                
        this.widget = {
            view: function() {
                return m("div#digi", [       
                    m("h1", "Digi/Igate configuration"),
                    (t.errmsg != null ? m("div#errmsg", t.errmsg) : null),
                    m("form.digi", [  
                        m("div.field", 
                            m("span.leftlab", {class: "subsect"}, "Digipeater: "),  
                                m(checkBox, {id: "digi_on",  checked: t.data.digiOn, onclick: toggle("digiOn") }, "Activate")), 
                        m("div.field", 
                            m("span.leftlab", "Digipeat modes: "), [
                                m(checkBox, {id: "wide1_on", checked: t.data.wide1, onclick: toggle("wide1")}, "Wide-1 "), nbsp,
                                m(checkBox, {id: "sar_on", checked: t.data.sar, onclick: toggle("sar")}, "SAR preempt ")
                            ]), br,
                        m("div.field", 
                            m("span.leftlab", {class: "subsect"}, "Internet gate: "),  
                                m(checkBox, {id: "igate_on", checked: t.data.igateOn, onclick: toggle("igateOn")}, "Activate")) ,
                        m("div.field", 
                            m("span.leftlab", "APRS/IS server: "),  
                            m(textInput, {id:"aprs_server", value: t.data.server, size: 20, maxLength:40, onchange: dirty,
                                regex: /^[a-zA-Z0-9\-\.]+$/i })),
                        m("div.field", 
                            m("span.leftlab", "Port number: "),  
                            m(textInput, {id:"server_port", value: t.data.port, size: 5, maxLength:5, onchange: dirty,
                                regex: /^[0-9\-]+$/i })),
                        m("div.field", 
                            m("span.leftlab", "Username: "),  
                            m(textInput, {id:"username", value: t.data.user, size: 10, maxLength:30, onchange: dirty,  
                                regex: /^[a-zA-Z0-9\-]+$/i })),
                        m("div.field", 
                            m("span.leftlab", "Passcode: "),  
                            m(textInput, {id:"passcode", value: t.data.passcode, size: 5, maxLength:5, onchange: dirty,
                                regex: /^[0-9\-]+$/i })), 
                      
                      
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
            toNumber(obj, "port"); toNumber(obj, "passcode"); 

            t.keys.getSelectedSrv().PUT( "api/digi", JSON.stringify(obj),
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
        this.keys.getSelectedSrv().GET( "api/digi", null, 
            st => {
              //  const st = JSON.parse(x);
                this.data = st;
                this.data.server = m.stream(st.server);
                this.data.port = m.stream(""+st.port);
                this.data.user = m.stream(st.user);
                this.data.passcode = m.stream(st.passcode);
                this.dirty = false;         
                this.clearerr();
            },
            x=> { 
                console.log(x);
                this.error("Cannot GET data (se browser log)", x);
            }
        );
    }
    
    
    
    onActivate() {
        this.getInfo();
    }
    
} /* class */




pol.widget.setFactory( "core.digiSetup", {
        create: () => new pol.core.digiSetup()
    });



