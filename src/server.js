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

/** @namespace */
var pol = pol || {};
pol.core = pol.core || {};

let CONFIG = {
    datastore: null
}




/* Generic call to REST API */
pol.core.ajax = (type, service, data, success, error) => {
    return $.ajax( service, {
        type: type,
        data: data, 
        success: success,
        error: error,  
        contentType: false,
        processData: (type!="POST"),
        crossDomain: true,
        xhrFields: { withCredentials: false },
    });
}
    



    
/**
 * Abstract class for server backends. Supports REST style webservices. 
 * There is one instance per associated tracker.
 */
pol.core.Server = class {
    
    /**
     * Constructor.
     */
    constructor(id, ipaddr) {
        const t = this;
        t.id = "NOCALL";
        t.url = "";
        t.useip = false; 
        t.setId(id, ipaddr);
        t.key = null;
        
        /* Try to get key from datastore */
        CONFIG.datastore.getItem("arctic.key."+t.id)
            .then( x=> {t.key=x;});
    }
    

    /**
     * Call REST API on server. 
     * @param type: String - HTTP method
     * @param service: String - Service url. 
     * @param data: PlainObject|String|Array
     * @param error:  Function( jqXHR jqXHR, String textStatus, String errorThrown )
     * @param success: Function( Anything data, String textStatus, jqXHR jqXHR )
     */
    ajax(type, service, data, success, error) {
        const nonce = pol.security.getRandom(8);
        data = (data==null ? "" : data);
        if (this.key == null) {
            console.warn("KEY NOT SET");
            error({message:"Key not set"});
            return;
        }
        
        this.getHmac(nonce, data)
            .then( hash => {
                this._ajax(type, service, data, success, error, 
                    {'Arctic-Nonce':nonce, 'Arctic-Hmac':hash }
                );
            })
            .catch( e=> {console.log("ERROR", e); }); 
    }
        
                
    _ajax(type, service, data, success, error, headers) {
        return $.ajax(this.url+service,  {
            type: type,
            data: data, 
            success: success,
            error: error,  
            contentType: false,
            processData: (type!="POST"),
            crossDomain: true,
            xhrFields: { withCredentials: true }, 
            headers: headers
        });
    }


    
    
    /* Generate HMAC. 
     * If the message is non-empty, generate a SHA256 hash from it and use this 
     * in the generation of a HMAC
     */
    async getHmac(nonce, message) {
        let msgHash = "";
        if (this.key==null)
            return null;
        if (message != null && message != "")
            msgHash = await pol.security.Sha256_B64(message)
        return await pol.security.hmac_Sha256_B64(this.key, nonce+msgHash);
    }
    
    
    
    
    /* Set the secret key and save it in datastore */
    async setKey(secret) {
        await pol.security.hmac_getKey(secret)
           .then( x=> {
               this.key = x;
               CONFIG.datastore.setItem("arctic.key."+this.id, x);
            } );
        return true;
    }
    
    
    /* Remove the secret key */
    removeKey() {
        CONFIG.datastore.removeItem("arctic.key."+this.id);
        this.key = null;
    }
    
    
    setUrl(u) {
        this.url = u;
    }
    
    
    setId(id, ipaddr) {
        console.log("SERVER SET ID: ", id, ipaddr, this.useip);
        this.id=id;
        
        if (this.useip)
            return;
        if (ipaddr != null) {
            this.setUrl("https://" +ipaddr+ "/");
            this.useip = true;
        }
        /* If argument is a a url */
        else if (/http(s)?:\/\//.test(id))
            this.setUrl(id);
        
        /* If it is a callsign */
        else if (/[A-Za-z0-9\-]+$/.test(id))
            this.setUrl("https://Arctic-" + id.toUpperCase() +".local/");
        
        /* Else (IP address) */
        else
            this.setUrl("https://" +id+"/");
    }


    
    /* GET HTTP operation */
    GET(service, data, success, error) {
        return this.ajax('GET', service, data, success, error); 
    }


    POST(service, data, success, error) {
        return this.ajax('POST', service, data, success, error); 
    }


    PUT(service, data, success, error) {
        return this.ajax('PUT', service, data, success, error); 
    }


    DELETE(service, success, error) {
        return this.ajax('DELETE', service, null, success, error); 
    }

} /* class */
