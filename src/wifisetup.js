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



pol.core.wifiSetup = class extends pol.core.Widget {

    constructor() {
        super();
        const t = this;
        t.classname = "core.wifiSetup"; 
        t.data = {
            apssid: "", appass:m.stream(""),  
            fwurl:m.stream(""), apikey:m.stream(""),
            ap_0_ssid:m.stream(""), ap_0_pw:m.stream(""), 
            ap_1_ssid:m.stream(""), ap_1_pw:m.stream(""),
            ap_2_ssid:m.stream(""), ap_2_pw:m.stream(""),
            ap_3_ssid:m.stream(""), ap_3_pw:m.stream(""), 
            ap_4_ssid:m.stream(""), ap_4_pw:m.stream(""),
            ap_5_ssid:m.stream(""), ap_5_pw:m.stream("")
        };
        t.dirty = false;    
        t.keys = pol.widget.get("core.keySetup");
        
        
        this.widget = {
            view: function() {
                return m("div", [  
                    m("h1", "WIFI / Internet configuration"),
                    m("form.aprs", [  
                        
                        m("div.field", 
                            m("span.leftlab", "Soft AP SSID: "),  
                            t.data.apssid),
                        m("div.field", 
                            m("span.leftlab", "Soft AP password: "),  
                            m(textInput, {passwd: true, value: t.data.appass, size: 12, maxLength:64,  onchange: dirty, regex: /^.*$/i })), br,
                
                        m("div.field", {className: "ap"},  
                            m("span.leftlab", "AP 1 (ssid,passwd): "),  
                            m(textInput, {value: t.data.ap_0_ssid, size: 12, maxLength:32,  onchange: dirty, regex: /^.*$/i }), 
                            m(textInput, {passwd: true, value: t.data.ap_0_pw, size: 12, maxLength:64, onchange: dirty, regex: /^.*$/i })), 
                        m("div.field", {className: "ap"},
                            m("span.leftlab", "AP 2 (ssid,passwd): "),  
                            m(textInput, {value: t.data.ap_1_ssid, size: 12, maxLength:32,  onchange: dirty, regex: /^.*$/i }), 
                            m(textInput, {passwd: true, value: t.data.ap_1_pw, size: 12, maxLength:64,  onchange: dirty, regex: /^.*$/i })),  
                        m("div.field", {className: "ap"},
                            m("span.leftlab", "AP 3 (ssid,passwd): "),  
                            m(textInput, {value: t.data.ap_2_ssid, size: 12, maxLength:32, onchange: dirty, regex: /^.*$/i }), 
                            m(textInput, {passwd: true, value: t.data.ap_2_pw, size: 12, maxLength:64, onchange: dirty, regex: /^.*$/i })), 
                        m("div.field", {className: "ap"},
                            m("span.leftlab", "AP 4 (ssid,passwd): "),  
                            m(textInput, {value: t.data.ap_3_ssid, size: 12, maxLength:32, onchange: dirty, regex: /^.*$/i }), 
                            m(textInput, {passwd: true, value: t.data.ap_3_pw, size: 12, maxLength:64, onchange: dirty, regex: /^.*$/i })), 
                        m("div.field", {className: "ap"},
                            m("span.leftlab", "AP 5 (ssid,passwd): "),  
                            m(textInput, {value: t.data.ap_4_ssid, size: 12, maxLength:32, onchange: dirty, regex: /^.*$/i }), 
                            m(textInput, {passwd: true, value: t.data.ap_4_pw, size: 12, maxLength:64, onchange: dirty, regex: /^.*$/i })), 
                        m("div.field", {className: "ap"},
                            m("span.leftlab", "AP 6 (ssid,passwd): "),  
                            m(textInput, {value: t.data.ap_5_ssid, size: 12, maxLength:32, onchange: dirty, regex: /^.*$/i }), 
                            m(textInput, {passwd: true, value: t.data.ap_5_pw, size: 12, maxLength:64, onchange: dirty, regex: /^.*$/i })), br,
                        
                        m("div.field", 
                            m("span.leftlab", "FW update URL: "),  
                            m(textInput, {id: "fwupd", value: t.data.fwurl, size: 31, maxLength:64,  onchange: dirty, regex: /^[a-zA-Z0-9\-\.\/\:]+$/i })),
                        m("div.field", {className: "key"},
                            m("span.leftlab", "API Key: "),  
                            m(textInput, {id: "apikey", value: t.data.apikey, size: 31, maxLength:128,  onchange: dirty, regex: /^.*$/i })), 
                        
                        m("div.butt", 
                            m("img.upd", {src: (t.dirty ? "img/warn.png" : "img/ok.png")}),
                            m("button", { type: "button", onclick: update}, "Update"),
                            m("button", { type: "button", onclick: reset }, "Reset"),
                            m("span.errmsg", t.errmsg)
                        )
                      
                    ])
                ])
            }
        };
            
        function dirty() {
            t.dirty = true;
        }
                    
        function toggle(x) {
            return ()=> {t.data[x] = (t.data[x] ? false : true); }
        }
        
        
        function reset() {
            t.getInfo();
        }
        
        
        function toNumber(obj, x) {
            obj[x] = Number(obj[x]());
        }

            
        function update() {
            var obj = Object.assign({}, t.data); 
            t.keys.getSelectedSrv().PUT( "api/wifi", JSON.stringify(obj),
                ()=> { 
                    t.dirty = false; 
                    t.data.apikey("");
                    t.clearerr();
                }, 
                x=> { 
                    t.error("Update error (see browser log)", x);
                }
            );
        }
    }    
        

        
    getInfo() {
         this.keys.getSelectedSrv().GET( "api/wifi", null, 
            st => {
              //  const st = JSON.parse(x);
                this.data = st;
                this.data.appass = m.stream(st.appass);
                this.data.htuser = m.stream(st.htuser);
                this.data.htpass = m.stream(st.htpass);
                this.data.fwurl = m.stream(st.fwurl);
                this.data.apikey = m.stream("");
                  // FIXME: Don't send the key from the server
                for (var i=0; i<6; i++) {
                    this.data['ap_'+i+'_ssid'] = m.stream(st['ap_'+i+'_ssid']);
                    this.data['ap_'+i+'_pw'] = m.stream(st['ap_'+i+'_pw']);
                }
                this.dirty = false;
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




pol.widget.setFactory( "core.wifiSetup", {
        create: () => new pol.core.wifiSetup()
    });



