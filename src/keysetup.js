

/**
 * Set up associations with trackers and keys for authentication.
 */

pol.core.keySetup = class extends pol.core.Widget {

    constructor() {
        super();
        const t = this;
        t.classname = "core.keySetup"; 
        
        /* 
         * List of associated trackers and which of them is selected. 
         * If selected is -1 this means that no trackers are selected. 
         */
        t.myTrackers = [];
        t.myServers = [];
        t.selected = -1;
        
        /* Tracker id field - callsign (URL is also possible) */
        t.trackerid = m.stream("");
        
        /* 
         * Secret key for authentication and indication if association 
         * to selected tracker is authenticated.
         */ 
        t.key = m.stream("");
        t.auth = false;
        
        /* Dirty bit */
        t.dirty = false; 
        
        
        this.widget = {
            view: function() {
                let i=0;
                return m("div", [       
                    m("h1", "Access and Key setup"),     
                    m("div.itemList", t.myTrackers.map( x=> {
                        const cls = (x.access ? "allowed" : 
                            (x.denied ? "denied" : 
                                (x.active ? "active" : "unknown"))); 
                        return [ m("span.box", [ 
                            m("img",  {src: "img/delete.png", onclick: apply((y)=>t.removeTracker(y), i)}),
                            m("span."+cls, {onclick: apply(_select, i++)}, x.id), nbsp]
                        ), " "]
                    })),
                    
                    m("form.key", [  
                        br,                     
                        m("div.field", 
                            m("span.leftlab", "Tracker id: "),  
                            m(textInput, {value: t.trackerid, size: 15, maxLength:32,  onchange: dirty, regex: /^[a-zA-Z0-9\-\.]+$/i })),
                        m("div.field", {className: "key"},
                            m("span.leftlab", "Server key: "),  
                            m(textInput, {value: t.key, size: 32, maxLength:128,  onchange: dirty, regex: /^.*$/i })),
                        m("div.field", 
                            m("span.leftlab", "Key set: "),  
                            m("span", (t.hasKey() ? "Yes" : "No"))), 
                      
                        m("div.butt", 
                            m("img.upd", {src: (t.dirty ? "img/warn.png" : "img/ok.png")}),
                            m("button", { type: "button", onclick: update}, "Update"),
                            m("button", { type: "button", onclick: reset}, "Clear"),
                            m("button", { type: "button", onclick: add}, "Add"),
                            m("span.errmsg", t.errmsg)
                        )
                    ])
                ])
            }
        };

        
        datastore.getItem("arctic.mytrackers")
            .then( x=> {
                t.myTrackers=x;
                if (t.myTrackers == null) 
                    t.myTrackers = [];
                else
                    t.selected = 0;
                
                for (const i in t.myTrackers)
                    t.myServers[i] = new pol.core.Server(t.myTrackers[i].id)
                m.redraw();
             });
            
        datastore.getItem("arctic.selected")
            .then( x => {
                if (x < 0)
                    return;
                t.selected = x;
                m.redraw();
            });
            
            
            
        setTimeout(scanTrackers,   2000);
        setInterval(scanTrackers, 20000);
        setInterval(scanMdns,     25000);
        
        
        
        function _select(i) {
            t.select(i);
            datastore.setItem("arctic.selected", i);
        }   
        
        
        
        /* Get info from server (tracker) */    
        function scanTrackers() {
            for (const i in t.myTrackers) 
                t.pingTracker(i);
            m.redraw();
        }
        
        
        function scanMdns() {
            /* Use the first active tracker found to discover other trackers through mDNS */
            for (const i in t.myTrackers)
                if (t.myTrackers[i] && t.myTrackers[i].server && 
                       typeof t.myTrackers[i].server.GET == "function" &&  t.myTrackers[i].access==true) {
                    t.getMdns(i);
                    break;
                }
        }
        
        
        
        /* 
         * Add tracker to list. 
         */
        function add() {
            t.addTracker(t.trackerid());
            t.dirty = false;
        }
        
        
        
        /*
         * Update the key and/or id of selected tracker.
         */
        function update() {
            /* Tracker id */
            if (t.trackerid() != "") {
                t.getSelected().id = t.trackerid();
                t.getSelectedSrv().setId(t.trackerid());
                t.dirty = false; 
            }
            
            /* Key */
            if (t.key() == "")
                return;
            t.getSelectedSrv().setKey(t.key())
              .then( ()=> {
                 t.key("");
                 t.dirty = false; 
                 t.getInfo();
              });
            m.redraw();
        }
        
        
        
        function dirty() {
            t.dirty = true;
        }
        
        

        function reset() {
            t.trackerid("");
            t.key("");
        }

            
        
        /* Apply a function to an argument. Returns a new function */
        function apply(f, id) {return function() { f(id); }};  
    }    
        
        
        
    getSelected() {
        return this.myTrackers[this.selected];
    }
        
        
    getSelectedSrv() {
        return this.myServers[this.selected];
    }
        
        
    select(i) {
        if (i==null || i<0)
            return;
        const tr = this.myTrackers[i];
        if (! tr.server || tr.server==null) 
            tr.server = new pol.core.Server(tr.id);
        
        this.selected = i;
        this.trackerid(this.getSelected().id);
        this.key("");
        datastore.setItem("arctic.selected", i);
    }
        
    
    /*
     * Select next tracker in list. 
     */
    selectNext() {
        if (this.myTrackers.length <= 1)
            return;
        let i = this.selected;
        let orig = i;
        do {
            i = (i+1) % this.myTrackers.length;
            this.select(i);
        } while (!this.isAvailable() && i != orig);
    }
    
    
    /*
     * Select previous tracker in list.
     */
    selectPrev() {
        if (this.myTrackers.length <= 1)
            return;
        let i = this.selected;
        let orig = i;
        do {
            i = i-1;
            if (i<0) i=this.myTrackers.length-1;
            this.select(i);
        } while (!this.isAvailable() && i != orig);
    }
    
        
    /*
     * Add tracker to the list 
     */    
    addTracker(id) {
        id = id.toUpperCase();
        if (this.exists(id)) {
            return false;
        }
        const i = this.myTrackers.push( { id:id, access:false, denied:false} ) - 1; 
        const j = this.myServers.push( new pol.core.Server(id) );
        if (i != j)
            console.error("Tracker-list doesn't correspond to server-list");
        
        this.dirty = false;
        datastore.setItem("arctic.mytrackers", this.myTrackers);
        m.redraw();
        console.log("Added tracker: "+id+ " trying to ping it.", i);
        this.pingTracker(i);
        return true;
    }
    
    
    
    /*
     * Remove tracker from the list.
     */    
    removeTracker(i) {
        console.log("removeTracker: "+i);
        this.myTrackers.splice(i, 1);
        this.myServers.splice(i, 1);
        datastore.setItem("arctic.mytrackers", this.myTrackers);
        if (this.selected >= i)
                this.selected--;
        datastore.setItem("arctic.selected", this.selected);
    }
        
        
                
    pingTracker(i) {
        const t = this;
        t.myTrackers[i].access=false;
        this.dirty = false;
        if (t.myServers[i].key != null)
            t.getInfo(i);
    }
    
        
    /*
     * Return true if tracker already exists in list
     */
    exists(tr) {
        for (const x of this.myTrackers)
            if (x.id == tr)
                return true;
        return false;
    }
        

    hasKey() {
        return this.getSelected() && this.getSelected().server &&
            this.getSelected().server.key != null;
    }
    
        
    /* 
     * Return true if we are authorised for access to the selected tracker.
     */ 
    isAuth() 
        {return this.auth;}
        
    isAvailable() 
        {return this.auth && this.getSelected().access}
        
    
    /* 
     * Set if we are authorised for access to the selected tracker.
     * a = we have acccess. d = access is denied. 
     */
    setAuth(i, a, d) {
        if (i == this.selected)
            this.auth = a;
        if (i<0)
            i=this.selected;
        if (i >= 0) {
            this.myTrackers[i].access = a; 
            this.myTrackers[i].denied = d; 
        }       
        m.redraw();
    } 
        

    showError(i, x) {
        if (i==this.selected)
            this.error(x);
    }
        
        
    /* 
     * Contact the REST API of the selected tracker to determine if we are 
     * authenticated and authorised for access. 
     */    
    getInfo(i) {
        let srv = null;
        let t = this;
        this.clearerr();
        srv = t.getSelectedSrv();
        
        let auth_ok = false;
        setTimeout(()=> {
            if (auth_ok == false) {
                t.setAuth(i, false, false); 
                t.showError(i, "Timeout (no response)");
            }
        }, 10000);
        
        srv.GET( "api/info", null, 
            st => {
                t.setAuth(i, true, false);
                auth_ok = true;
                m.redraw();
            },            
            (x,y,z) => { 
                const denied = (x.status != null && x.status==401) 
                t.setAuth(i, false, denied); 
                m.redraw();
                if (denied) 
                    t.showError(i, "Access denied");
                else
                    t.showError(i, "Cannot GET data (se browser log)", x);
            }
        );
    }
    
      
    getMdns(i) {
        let srv = null;
        let t = this;
        if (!i || i==-1)
            srv = server;
        else
            srv = t.myTrackers[i].server;
        
        srv.GET( "api/trackers", null, 
            ttr => {
                const tr = JSON.parse(ttr);
                if (tr == null || tr.length == 0) 
                    return; 
                for (const tt of tr) {
                    const id = tt.host.split(/[Aa]rctic-/);
                    if (id[1]) {
                        if (t.addTracker(id[1]))
                            console.log("MDNS TRACKER: ", tt.name, tt.host, tt.port);
                    }
                }
            },            
            x=> { 
            }
        );
    }
    
    
    
    
    
} /* class */




pol.widget.setFactory( "core.keySetup", {
        create: () => new pol.core.keySetup()
    });



