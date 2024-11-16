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

pol.core.aprsSetup = class extends pol.core.Widget {

    constructor() {
        super();
        const t = this;
        t.classname = "core.aprsSetup"; 
        t.data = {
            mycall:m.stream(""), symbol:m.stream(""), path:m.stream(""), comment:m.stream(""), 
            txfreq:m.stream(""), rxfreq:m.stream(""),
            maxpause:m.stream(""), minpause:m.stream(""), mindist:m.stream(""), repeat:m.stream(""), turnlimit:m.stream(""),
            timestamp:false, compress:false, altitude:false, extraturn:false };
        t.dirty = false;    
        t.keys = pol.widget.get("core.keySetup");
        
        
        this.widget = {
            view: function() {
                return m("div", [  
                    m("h1", "APRS configuration"),
                    (t.errmsg != null ? m("div#errmsg", t.errmsg) : null),
                    m("form.aprs", [  
                    
                        m("div.field", 
                            m("span.leftlab", "My callsign: "),  
                            m(textInput, {id:"callsign", value: t.data.mycall, size: 10, maxLength:15, 
                                onchange: dirty, regex: /^[a-zA-Z0-9\-]+$/i })),
                        m("div.field", 
                            m("span.leftlab", "Symbol (tab/sym): "),  
                            m(textInput, {id:"symbol", value: t.data.symbol, size: 2, maxLength:2, 
                                onchange: dirty, regex: /^..$/i })),
                        m("div.field", 
                            m("span.leftlab", "Report comment: "),  
                            m(textInput, {id:"comment", value: t.data.comment, size: 24, maxLength:40, 
                                onchange: dirty, regex: /^.*$/i })), 
                        m("div.field", 
                            m("span.leftlab", "Digipeater path: "),  
                            m(textInput, {id:"path", value: t.data.path, size: 24, maxLength:40, 
                                onchange: dirty, regex: /^([a-zA-Z0-9\-]+)(,([a-zA-Z0-9\-]+))*$/i })),
                        m("div.field", 
                            m("span.leftlab", "TX frequency: "),  
                            m(textInput, {id:"txfreq", value: t.data.txfreq, size: 7, maxLength:7, 
                                onchange: dirty, regex: /^[0-9]{7}$/i })),
                        m("div.field", 
                            m("span.leftlab", "RX frequency: "),  
                            m(textInput, {id:"rxfreq", value: t.data.rxfreq, size: 7, maxLength:7, 
                                onchange: dirty, regex: /^[0-9]{7}$/i })), br,
                      
                        m("div.field",                                    
                            m("span.leftlab", {class: "subsect"}, "Track settings: "), m("span.check", [
                                m("label", m(checkBox, {id: "timestamp_on", checked: t.data.timestamp, onclick: toggle("timestamp")}, "Timestamp ")), nbsp,
                                m("label", m(checkBox, {id: "compress_on",  checked: t.data.compress,  onclick: toggle("compress")}, "Compress ")), " ", 
                                m("label", m(checkBox, {id: "altitude_on",  checked: t.data.altitude,  onclick: toggle("altitude")}, "Altitude "))
                            ])), 
                        
                        m("div.field", 
                            m("span.leftlab", "Turn limit: "),  
                            m(textInput, {id:"turnlimit", value: t.data.turnlimit, size: 4, maxLength:4, 
                                onchange: dirty, regex: /^[0-9]{1,3}$/i }), nbsp, "(degrees)"),
                        m("div.field", 
                            m("span.leftlab", "Max pause: "),  
                            m(textInput, {id:"maxpause", value: t.data.maxpause, size: 4, maxLength:4, 
                                onchange: dirty, regex: /^[0-9]{1,3}$/i }), nbsp, "(seconds)"),
                        m("div.field", 
                            m("span.leftlab", "Min pause: "),  
                            m(textInput, {id:"minpause", value: t.data.minpause, size: 4, maxLength:4, 
                                onchange: dirty, regex: /^[0-9]{1,3}$/i }), nbsp, "(seconds)"),
                        m("div.field", 
                            m("span.leftlab", "Min distance: "), 
                            m(textInput, {id:"mindist", value: t.data.mindist, size: 4, maxLength:4, 
                                onchange: dirty, regex: /^[0-9]{1,3}$/i }), nbsp, "(meters)"), br,
                      
                        m("div.field", 
                            m("span.leftlab", {class: "subsect"}, "Extra posreports: "), 
                            m(checkBox, {id: "extraturn", checked: t.data.extraturn, onclick: toggle("extraturn")}, "Add when turning") ), 
                        m("div.field", 
                            m("span.leftlab", "N reports: "),  
                            m(textInput, {id:"repeat", value: t.data.repeat, size: 1, maxLength:2, 
                                onchange: dirty, regex: /^[0-4]{1}$/i })),
                                 
                        m("div.butt", 
                            m("img.upd", {src: (t.dirty ? "img/warn.png" : "img/ok.png")}),
                            m("button", { type: "button", onclick: update}, "Update"),
                            m("button", { type: "button", onclick: reset }, "Reset"),
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
            toNumber(obj, "maxpause"); toNumber(obj, "minpause"); 
            toNumber(obj, "mindist"); toNumber(obj, "repeat"); toNumber(obj, "turnlimit");

            t.keys.getSelectedSrv().PUT( "api/aprs", JSON.stringify(obj),
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
         this.keys.getSelectedSrv().GET( "api/aprs", null, 
            st => {
              //  const st = JSON.parse(x);
                this.data = st;
                this.data.mycall = m.stream(st.mycall);
                this.data.symbol = m.stream(""+st.symbol);
                this.data.comment = m.stream(st.comment);
                this.data.path = m.stream(st.path);
                this.data.txfreq = m.stream(st.rxfreq);
                this.data.rxfreq = m.stream(st.rxfreq);
                
                this.data.turnlimit = m.stream(st.turnlimit);
                this.data.maxpause = m.stream(st.maxpause);
                this.data.minpause = m.stream(st.minpause);
                this.data.mindist = m.stream(st.mindist);
                this.data.repeat = m.stream(st.repeat); 
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




pol.widget.setFactory( "core.aprsSetup", {
        create: () => new pol.core.aprsSetup()
    });



