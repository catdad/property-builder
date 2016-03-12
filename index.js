/* jshint node: true */

function defineOnObj(obj, prop, val) {
    if (typeof val === 'function') {
        val.bind(obj);
    }

    obj[prop] = val;
}

function Builder(obj, desc) {
    if (!(this instanceof Builder)) {
        return new Builder(obj);
    }
    
    var prop;
    desc = desc || {};
    
    var define = (function(that) {
        return function define(prop, val) {
            return defineOnObj(that, prop, val);
        };
    })(this);
    
    function property(val) {
        prop = val;
        return this;
    }
    
    function configurable(val) {
        desc.configurable = (val === undefined) ? true : !!val;
        return this;
    }
    
    function enumerable(val) {
        desc.enumerable = (val === undefined) ? true : !!val;
        return this;
    }
    
    function writable(val) {
        delete desc.get;
        delete desc.set;
        
        desc.writable = (val === undefined) ? true : !!val;
        return this;
    }
    
    function value(val) {
        desc.value = val;
        return this;
    }
    
    function getter(val) {
        if (typeof val !== 'function') {
            return this;
        }
        
        delete desc.writable;
        delete desc.value;
        
        desc.get = val;
        return this;
    }
    function setter(val) {
        if (typeof val !== 'function') {
            return this;
        }
        
        delete desc.writable;
        delete desc.value;
        
        desc.set = val;
        return this;
    }
    
    function ret() {
        if (!prop) {
            throw new Error('property was not set');
        }
        
        return Object.defineProperty(obj, prop, desc);
    }
    
    function negative(func) {
        return function(val) {
            if (val !== undefined) {
                return func(val);
            } else {
                return func(false);
            }
        };
    }

    function and() {
        var andObj = {
            configurable: configurable.bind(this),
            enumerable: enumerable.bind(this),
            writable: writable.bind(this)
        };
        
        Object.defineProperty(andObj, 'not', {
            enumerable: true,
            get: function() {
                return not();
            }
        });
        
        return andObj;
    }
    
    function not() {
        
        var notObj = {
            configurable: negative(configurable.bind(this)),
            enumerable: negative(enumerable.bind(this)),
            writable: negative(writable.bind(this))
        };
        
        Object.defineProperty(notObj, 'and', {
            enumerable: true,
            get: function() {
                return and();
            }
        });
        
        return notObj;
    }
    
    define('property', property);
    define('configurable', configurable);
    define('enumerable', enumerable);
    define('writable', writable);
    define('value', value);
    define('get', getter);
    define('set', setter);

    define('return', ret);

    defineOnObj(this, 'and', (and.bind(this))());
    defineOnObj(this, 'not', (not.bind(this))());
    
    this.description = desc;
}

module.exports = function propertyBuilder(obj) {
    return new Builder(obj, {});
};
