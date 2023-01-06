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

/** @namespace */
var pol = pol || {};
pol.core = pol.core || {};


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
    
    
/* Base-64 encoding */
function bin2base64(arr) {
    const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; // base64 alphabet
    const bin = n => n.toString(2).padStart(8,0); // convert num to 8-bit binary string
    const l = arr.length
    let result = '';

    for(let i=0; i<=(l-1)/3; i++) {
        let c1 = i*3+1>=l; // case when "=" is on end
        let c2 = i*3+2>=l; // case when "=" is on end
        let chunk = bin(arr[3*i]) + bin(c1? 0:arr[3*i+1]) + bin(c2? 0:arr[3*i+2]);
        let r = chunk.match(/.{1,6}/g).map((x,j)=> j==3&&c2 ? '=' :(j==2&&c1 ? '=':abc[+('0b'+x)]));  
        result += r.join('');
    }
    return result;
}

async function hmac_getKey(secret) {
    const enc = new TextEncoder("utf-8");
    const algorithm = { name: "HMAC", hash: "SHA-256" };
    const _key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        algorithm,
        false, ["sign", "verify"]
    );
    return _key;
}


/* Generate a hmac-sha256 hash from key and message */
async function hmac_Sha256_B64(key, message) {
    const enc = new TextEncoder("utf-8");
    const algorithm = { name: "HMAC", hash: "SHA-256" };
    const hashBuffer = await crypto.subtle.sign(
        algorithm.name, 
        key, 
        enc.encode(message)
    );  
    const hashArray = Array.from(new Uint8Array(hashBuffer));  
    const hashHex = bin2base64(hashArray);
    return hashHex;
}


function getRandom(n) {
    /* 8 bytes is 64 bits */
    const rnd = new Uint8Array(n);
    crypto.getRandomValues(rnd);
    return bin2base64(rnd);
}



    
/**
 * Abstract class for server backends. Supports REST style webservices. 
 * There is one instance per associated tracker.
 */
pol.core.Server = class {
    
    /**
     * Constructor.
     */
    constructor(id) {
        const t = this;
        t.id = "NOCALL";
        t.url = "";
        t.setId(id);
        t.key = null;
        datastore.getItem("arctic.key."+t.id)
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
        const nonce = getRandom(8);
        data = (data==null ? "" : data);
        if (this.key == null) {
            error({message:"Key not set"});
            return;
        }
        
        this.getHmac(nonce+data)
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
            xhrFields: { withCredentials: false }, 
            headers: headers
        });
    }

    
    /* Generate HMAC */
    async getHmac(message) {
        return hmac_Sha256_B64(this.key, message);
    }
    
    
    /* Set the secret key and save it in datastore */
    async setKey(secret) {
        await hmac_getKey(secret)
           .then( x=> {
               this.key = x;
               datastore.setItem("arctic.key."+this.id, x);
            } );
        return true;
    }
    
    
    /* Remove the secret key */
    removeKey() {
        datastore.removeItem("arctic.key."+this.id);
        this.key = null;
    }
    
    
    setUrl(u) {
        this.url = u;
    }
    
    setId(id) {
        this.id=id;
        if (/http(s)?:\/\//.test(id))
            this.setUrl(id);
        else if (/[A-Za-z0-9\-]+$/.test(id))
            this.setUrl("http://Arctic-" + id.toUpperCase() +".local/");
        else
            this.setUrl("http://" +id+"/");
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
