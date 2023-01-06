 
/* Data storage */
localforage.config({
    driver      : localforage.INDEXEDDB,
    version     : 1.0,
    storeName   : 'Arctic', // Should be alphanumeric, with underscores.
    description : 'Web app datastore for arctic tracker'
});


var datastore = localforage.createInstance({
  name: "ArcticTracker"
});


/* 
 * Server instance. Initially we have an instance with id=NOCALL
 */
let server = new pol.core.Server("NOCALL");
let selectedWidget = null;


/*
 * Show widget. 
 */ 
function show(id) {
    return ()=> {
        var x = pol.widget.get(id);
        x.activate( $('#widget')[0] );
        selectedWidget = x;
    }
}

setTimeout(show("core.keySetup"), 300);


function nextTracker() {
    pol.widget.get("core.keySetup").selectNext();
    selectedWidget.onActivate();
}


function prevTracker() {
    pol.widget.get("core.keySetup").selectPrev();
    selectedWidget.onActivate();
}


function isOpen() {
    return server.key!=null && pol.widget.get("core.keySetup").isAuth();
}


/* Main Menu */
menu = {
    view: function() {
        return m("div.menu", [ 
            m("img",  {onclick: show("core.keySetup"), 
                 src: (isOpen() ? "img/unlocked.png" : "img/locked.png") }),
            m("span", {onclick: show("core.statusInfo")},   "Status"),
            m("span", {onclick: show("core.wifiSetup")},    "Wifi"),   
            m("span", {onclick: show("core.aprsSetup")},    "Aprs"),
            m("span", {onclick: show("core.digiSetup")},    "Digi/Igate"), 
            m("span", {onclick: show("core.trklogSetup")},  "Trklog"), nbsp,
            server.id, nbsp,
            m("img", {src:"img/back.png", id: "fwd", onclick: prevTracker}),
            m("img", {src:"img/forward.png", id: "fwd", onclick: nextTracker})
        ])
    }
};
m.mount($("div#heading")[0], menu);
m.redraw();
