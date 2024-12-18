 
/*
 Superclass for widgets
 
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
/** @namespace */
var pol = pol || {};
pol.core = pol.core || {};
pol.ui = pol.ui || {};


/** @namespace */
pol.widget =  {};



/**
 * What widget-instances are actually stored. Maps to class-names (see above).
 */
pol.widget._stored = {};

/* Active widgets */
pol.widget._active = {};

pol.widget._factory = {};





 /**
  * set factory function.
  * @param {string} id, name of the class. 
  * @param {function} f, function that instantiate the widget.
  */
pol.widget.setFactory = function(id, arg) {
    pol.widget._factory[id] = arg; 
}



/**
 * Restore widgets that were saved in local storage as active. 
 */
pol.widget.restore = function() {
    pol.widget._stored = CONFIG.get("core.widget._stored");
    if (pol.widget._stored == null)
        pol.widget._stored = {};
    
    for (const x in pol.widget._stored) {
        if (pol.widget._stored[x] == null)
            continue;
        
        const w = pol.widget.get(x); 
        pol.widget._active[x] = w;
        const pos = CONFIG.get("core.widget."+x);
        if (w!=null) 
            w.activatePopup(x, pos, true);
        
        const fact = pol.widget._factory[x];
        if (!fact || !fact.create) {
            CONFIG.remove("core.widget."+x);
            delete pol.widget._stored[x];
            CONFIG.store("core.widget._stored", pol.widget._stored, true);
            continue;
        }
        if (fact.onRestore && fact.onRestore != null)
            fact.onRestore();
    }
}
    
    
/**
 * Get a widget object. Use factory to create it if necessary. 
 */
pol.widget.get = function(id) {
    let x = pol.widget._active[id]; 
    const fact = pol.widget._factory[id];
    if (!fact || !fact.create) {
        console.warn("No factory found for: "+id);
        return null;
    }
    if (!x) 
        x = pol.widget._active[id]=fact.create();  
    return x;
}

    
/**
 * Activate a widget object (in a popup). Use factory to create it if necessary. 
 */    
pol.widget.start = function(id, pos, pinned, saved, f) {
    const x = pol.widget.get(id);
    if (x==null)
        return;
    x.activatePopup(id, pos, pinned, saved);    
    if (f && f!=null) 
        setTimeout(()=>f(x), 300);
}
    


/**
 * Superclass for widgets in draggable popup windows. 
 */

pol.core.Widget = class {
    
    constructor() {
        this.pos = null;
        this.saved = true;
        this.classname = null;
        this.active = false; 
        this._allowPopup = true;
        
        this.rs_running = false; 
        this.rs_to = null;
        this.rs_func = null;
        this.rs_first = true; 
        this.rs_ro = new ResizeObserver( entries => {
            for (let entry of entries) {
                if (this.rs_running && this.rs_to!=null)
                    clearTimeout(this.rs_to);
                
                this.rs_running = true;
                this.rs_to = setTimeout(()=> {
                    if (this.rs_first == true) {
                        this.rs_first = false; 
                        return; 
                    }
                    if (this.rs_func)
                        this.rs_func();
                    this.rs_running = false;
                    this.rs_to = null;
                },400)
            }
        });
        
    }

    resizeObserve(func) {
        this.rs_ro.observe($("#map").get(0));
        this.rs_func = func;
    }
 
    isActive() 
        { return this.active; }
        
    allowPopup(allow) {
        this._allowPopup = allow;
    }
 
    /** 
     * Display widget in the given DOM element. 
     * @param {Element} w - DOM element to display the layer switcher.  
     */
    activate(w) { 
        console.assert(w && w != null, "w="+w);
        this.delement = w; 
        m.mount(this.delement, this.widget);
        this.delement.addEventListener("unload", this.onclose);
        this.active = true; 
        if (this.onActivate)
            this.onActivate(); 
    }

    
    onclose() { 
        this.rs_ro.disconnect();
    }
 
 
    /** 
     * Display widget in a draggable popup window. 
     * @param {string} id - Identifier to be used for the DOM element
     * @param pixPos - Where on screen to put it.
     */
    activatePopup(id, pixPos, pinned, saved) 
    {
        console.assert(id != null && pixPos != null 
            && pixPos[0] >= 0 && pixPos[1] >= 0, "id="+id+", pixPos="+pixPos);
        if (!this._allowPopup)
            return null;
        if (pixPos == null)
            pixPos = [20, 20];
            
        const t = this; 
        this.pos = pixPos;        
        t.saved = saved;
        t.active = true; 
        t.errmsg = "";
        
        if (t.onActivate)
            t.onActivate(); 
        
        this.popup = browser.gui.showPopup( {
            vnode: this.widget,
            pixPos: pixPos,
            draggable: true,
            dragStop: dragStop,
            pin: saveCb,
            pinned: pinned,
            id: id,
            cclass: "widget",
            onclose: ()=> {unSave(); t.active=false; t.onclose();}
        });           

        if (this.popup && this.popup != null && this.popup.adjustedPos) 
            t.pos = this.popup.adjustedPos;
        t.close = ()=> { this.popup.close(); }
        return this.popup; 
        
     
        function saveCb(p) {
            if (!t.saved) 
                return;
            if (p) 
                save();
            else
                unSave();
        }
     
     
        function dragStop( event, ui ) {
            t.pos = [ui.position.left, ui.position.top];
            if (t.saved)
                save();
        }
     
     
        function save() {
            CONFIG.store("core.widget."+id, t.pos, true);
        
            if (!pol.widget._stored[id] || pol.widget._stored[id] == null) {
                pol.widget._stored[id] = true;
                CONFIG.store("core.widget._stored", pol.widget._stored, true); 
            }
        }
     
     
        function unSave() {
            CONFIG.remove("core.widget."+id, t.pos);
        
            if (pol.widget._stored[id] && pol.widget._stored[id] != null) {
                delete pol.widget._stored[id];
                CONFIG.store("core.widget._stored", pol.widget._stored, true); 
            }
        }
    }
    
    
    
    /* 
     * Set scrollable table 
     * FIXME: We may not need this anymore (see setScroll below) 
     */
    setScrollTable(topdiv, searchresult) {
        let ht = $('#map').height() - 
            ( $(topdiv).height() - $(searchresult).height()) - this.pos[1]- 8 ;
                        
        setTimeout( () => {
            if ($(searchresult).height() < ht) 
                ht = $(searchresult).height();
            $(searchresult+' table').table({height: Math.round(ht)}); 
        }, 200);
    }
    
    
    /* Set scrollable element (typically a div or table) */
    setScroll(topdiv, searchresult, scrollBottom) {
        let elem = $(searchresult);
        elem.css({"height":"unset"});
        
        setTimeout( () => {
            /* Calculate available space */
            let ht = $('#map').height() - 
                ( $(topdiv).height() - elem.height()) - this.pos[1] - 20 ;
            
            /* If too little space left, set the height to activate the scroller */
            if (elem.height() > ht) {
                const hht = elem.height();
                elem.css({
                    "display": "block", "overflow-y":"auto", "overflow-x":"hidden", "height":""+Math.round(ht) 
                });
                if (scrollBottom) 
                    elem.scrollTop(hht);
            }
        }, 100);
    }
    
    
    error(txt, x) {
        var msg = txt;
        if (x != null)
            if (x.status != null && x.status==401) 
                msg = "Access denied: "+x.responseText;
            else if (x.message != null)
                msg = x.message;
        
        this.errmsg = msg;
        console.warn(msg);
        m.redraw();
    }
    
    
    clearerr()
        { this.errmsg = null; m.redraw(); }
    
    
} /* class */
