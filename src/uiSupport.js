/*
 Misc. common functions and mithril modules for UI via DOM. 
 Lite version of the one found in Polaric Server webapp2.
 
 Copyright (C) 2025 Øyvind Hanssen, LA7ECA, ohanssen@acm.org
 
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



/* Some simple DOM elements */
window.br = m("br");
window.hr = m("hr");
window.nbsp = m.trust("&nbsp;");



/**
 * Input field with default values and syntax checking. 
 * @param {string} id - DOM element identifier. 
 * @param {number} size - size of field. 
 * @param {number} maxlength - max length of field.
 * @param {boolean} contentEditable - true if field can be edited by user. 
 * @param {regex} regex - Regular expression that defines what input is valid. 
 * @param {boolean} passwd - optional. true if password
 */
const textInput = {
 
    view: function(vn) {
        var t = this;
        var type = (!vn.attrs.passwd || vn.attrs.passwd==false ? "text" : "password");
 
        return m("input"+(vn.attrs.id != null? "#"+vn.attrs.id : ""), 
        { type: type, list: vn.attrs.list, config: vn.attrs.config, size: vn.attrs.size, maxLength: vn.attrs.maxLength, 
          contentEditable: (vn.attrs.contentEditable ? vn.attrs.contentEditable : true),
                
            oninput: function(ev) {
                vn.attrs.value(ev.target.value); 
                if (!vn.attrs.regex) 
                    return;                
                if (vn.attrs.regex.test(ev.target.value)) {
                    vn.state.cssclass = vn.attrs.className+" valid";
                    vn.dom.title = "Input OK";
                    $(vn.dom).attr("ok", true);
                }
                else {
                    vn.state.cssclass = vn.attr.className+" invalid";
                    vn.dom.title = "Invalid input!";
                    $(vn.dom).attr("ok", false);
                }    
            },
            onchange: function(ev) {
                vn.attrs.value(ev.target.value);
                t.cssclass = vn.attrs.className+"";
                if (vn.attrs.onchange !=null)
                    vn.attrs.onchange();
            },
            
            value: vn.attrs.value(),
            className: (t.cssclass ? t.cssclass : "")
        });
   }
}

window.textInput = textInput; // FIXME


/**
 *  Checkbox 
 *  Attributes: id, onclick, name, checked
 */
const checkBox = {
    view: function(vn) {
        return m("span.nobr", {title: vn.attrs.title}, 
            m("input"+(vn.attrs.id != null? "#"+vn.attrs.id : ""),
         {
            onclick: vn.attrs.onclick,
            type:"checkbox", name: vn.attrs.name, value: vn.attrs.id, 
            checked: (vn.attrs.checked ? "checked" : null),
            onchange: (vn.attrs.onchange)
         }), nbsp, vn.children);
    }
}

window.checkBox = checkBox; // FIXME



/**
 * Select box 
 * Attributes: 
 *  - id - id for div element
 *  - onchange - function to invoke when change happens
 *  - list - list of options (val and label)
 */ 
const select = {
    view: function(vn) {
        return m("select"+(vn.attrs.id != null? "#"+vn.attrs.id : ""), {onchange: vn.attrs.onchange}, vn.attrs.list.map(
            x => m("option", {value: x.val, style: x.style}, x.label) ));
    }
}

window.select = select; // FIXME; 


/*
 * Icon picker
 * Attributes: 
 *  - id - id for div element (optional)
 *  - icons - array of image file names.
 *  - default - index (in icons array) of icon to be selected by default. (optional) 
 */
const iconPick = {
    oncreate: function(vn) {
        const inp = vn.state;
        inp.id=vn.attrs.id;     
    },    
    
    doSelect: function(vn, x) {
        vn.state.selected = x;
        $("div#iconlist").css("visibility", "hidden");
        $("div#iconlist").css("max-height", "1px");
        $("#iconpick").get(0).value = x;                 
    },
    
    showIcons: function() {
        $("div#iconlist").css("visibility", "visible");
        $("div#iconlist").css("max-height", "");
    },
    
    view: function(vn) {
        const icons = vn.attrs.icons; 
        const dfl = (vn.attrs.default ? vn.attrs.default : 0); 
        const xx = (vn.attrs.value && vn.attrs.value!=null ? vn.attrs.value : icons[dfl]);
        const yy = (vn.state.selected ? vn.state.selected : xx);
        
        setTimeout( ()=> {
            if (yy && $("#iconpick").get(0))
                $("#iconpick").get(0).value = yy
        }, 600);
        
        return m("span", [ 
            m("span#iconpick", { onclick:() => this.showIcons(), 
                onchange: ()=> { vn.state.selected = $("#iconpick>img").val()} }, 
                m("img", {src: yy} )), 
                 
            m("div#iconlist", {style: "max-height: 1px"}, icons.map( x=> {
                return m("img", { src: x, onclick: ()=> this.doSelect(vn, x) })
            }) 
        )])
    }
    
}

window.iconPick = iconPick; // FIXME



   
 
// FIXME: Move to a another source file? 
function formatDTG(date) {
    const mths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
                  'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const ltime = new Date(date);
    const mth = mths[ltime.getMonth()]; 
    const day = ltime.getDate();
    const hour = ltime.getHours();
    const min = ltime.getMinutes();
    return day + ' ' +mth + ' ' + hour+":"+(min<=9 ? '0': '') + min; 
}



 
 
