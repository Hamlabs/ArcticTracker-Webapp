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

pol.core.aprsSetup = class extends pol.core.Widget {

    constructor() {
        super();
        const t = this;
        t.classname = "core.aprsSetup"; 
        t.data = {
            mycall:m.stream(""), symbol:m.stream(""), path:m.stream(""), comment:m.stream(""), 
            txfreq:m.stream(""), rxfreq:m.stream(""), freq:m.stream(""),txpower:m.stream(""), lora_sf:m.stream(""),lora_cr:m.stream(""),
            maxpause:m.stream(""), minpause:m.stream(""), mindist:m.stream(""), repeat:m.stream(""), turnlimit:m.stream(""),
            timestamp:false, compress:false, altitude:false, extraturn:false };
        t.dirty = false;    
        t.keys = pol.widget.get("core.keySetup");
        t.lora = true; 
        t.sym = m.stream("]");
        t.symtab = m.stream("/");
        
        
        
        const radio = { 
            view: function() {
                return m("span", [
                    m("div.field", 
                            m("span.leftlab", "TX frequency: "),  
                            m(textInput, {id:"txfreq", value: t.data.txfreq, size: 7, maxLength:7, 
                                onchange: dirty, regex: /^[0-9]{7}$/i })),
                    m("div.field", 
                            m("span.leftlab", "RX frequency: "),  
                            m(textInput, {id:"rxfreq", value: t.data.rxfreq, size: 7, maxLength:7, 
                                onchange: dirty, regex: /^[0-9]{7}$/i }))
                ])
            }
        };
        

        const lora_radio = { 
            view: function() {
                return m("span", [
                    m("div.field", 
                            m("span.leftlab", "Frequency: "),  
                            m(textInput, {id:"freq", value: t.data.freq, size: 9, maxLength:9, 
                                onchange: dirty, regex: /^[0-9]{9}$/i })),     
                    m("div.field", 
                            m("span.leftlab", "TX power level:"),
                            m(powerSelect) ),
                    m("div.field", 
                            m("span.leftlab", "Spread factor: "),  
                            m(textInput, {id:"lora_sf", value: t.data.lora_sf, size: 2, maxLength:2, 
                                onchange: dirty, regex: /^7|8|9|10|11|12$/i })),
                    m("div.field", 
                            m("span.leftlab", "Coding rate: "),  
                            m(textInput, {id:"lora_cr", value: t.data.lora_cr, size: 2, maxLength:2, 
                                onchange: dirty, regex: /^[5-8]$/i }))
                ])
            }
        };
        
        const symSelect = {
            view: function() {
                
                return m("span.symselect", [
                    m(textInput, {id:"symtab", size: 1, maxLength:1, value: t.symtab, regex: /[\/\\a-zA-Z]/i }),
                    m(textInput, {id:"symbol", size: 1, maxLength:1, value: t.sym, regex: /[a-zA-Z]/i }),
                    m(select, {
                        id: "symSelect", 
                        onchange: onSymSelect, 
                        list: [
                            {label: "Person (moving)", val: '/['},
                            {label: "Car", val: '/>'},
                            {label: "Car (van)", val: '/v'},
                            {label: "House", val: '/-'}, 
                            {label: "Red Cross", val: '/+'},
                            {label: "APRS igate", val: '/&'},
                            {label: "LoRa igate", val: 'L&'},
                            {label: "Fill-in digi", val: '1#'},
                        ]
                    })
                ])
            }
        }
        
        const powerSelect = {
            view: function() {
                
                return m("span.poselect", [
                    m(select, {
                        id: "poSelect", 
                        onchange: onPoSelect, 
                        list: [
                            {label: "0: 4 mW", val: 0},
                            {label: "1: 20 mW", val: 1},
                            {label: "2: 80 mW", val: 2},
                            {label: "3: 250 mW", val: 3}, 
                            {label: "4: 0.5 W", val: 4},
                            {label: "5: 0.7 W", val: 5},
                            {label: "5: 0.9 W", val: 6},
                        ]
                    })
                ])
            }
        }
        
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
                            m("span.leftlab", "Symbol:"),
                            m(symSelect) ),

                        m("div.field", 
                            m("span.leftlab", "Report comment: "),  
                            m(textInput, {id:"comment", value: t.data.comment, size: 24, maxLength:40, 
                                onchange: dirty, regex: /^.*$/i })), 
                        m("div.field", 
                            m("span.leftlab", "Digipeater path: "),  
                            m(textInput, {id:"path", value: t.data.path, size: 24, maxLength:40, 
                                onchange: dirty, regex: /^([a-zA-Z0-9\-]+)(,([a-zA-Z0-9\-]+))*$/i })),
                      
                        m("span", (t.lora ? m(lora_radio) : m(radio))), br,
                      
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
            
    
        /* Handler for when user selects symbol */
        function onSymSelect () {
            const sym = $('#symSelect').val();
            t.symtab(sym[0]); 
            t.sym(sym[1]);
            dirty();
            m.redraw();
        }
        
        function onPoSelect() { 
            const po = $('#poSelect').val();
            t.data.txpower(po);
            dirty();
        }
        
        
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
            t.data.symbol(t.symtab() + t.sym());
            var obj = Object.assign({}, t.data); 
            toNumber(obj, "maxpause"); toNumber(obj, "minpause"); 
            toNumber(obj, "mindist"); toNumber(obj, "repeat"); toNumber(obj, "turnlimit");
            toNumber(obj, "freq"); toNumber(obj, "txpower");
            obj.freq *= 1000;
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
                this.lora = !st.txfreq;

              //  const st = JSON.parse(x);
                this.data = st;
                this.data.mycall = m.stream(st.mycall);
                this.data.symbol = m.stream(""+st.symbol);
                this.symtab(st.symbol()[0]);
                this.sym(st.symbol()[1]);
                $('#symSelect').val(st.symbol());
                this.data.comment = m.stream(st.comment);
                this.data.path = m.stream(st.path);
                this.data.txfreq = m.stream(st.txfreq);
                this.data.rxfreq = m.stream(st.rxfreq);
                this.data.freq = m.stream(st.freq/1000);     
                this.data.txpower = m.stream(st.txpower);
                $('#poSelect').val(st.txpower());
                this.data.lora_sf = m.stream(st.lora_sf);
                this.data.lora_cr = m.stream(st.lora_cr);
                
                this.data.turnlimit = m.stream(st.turnlimit);
                this.data.maxpause = m.stream(st.maxpause);
                this.data.minpause = m.stream(st.minpause);
                this.data.mindist = m.stream(st.mindist);
                this.data.repeat = m.stream(st.repeat); 
                this.dirty = false;
                this.clearerr();
                m.redraw();
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



