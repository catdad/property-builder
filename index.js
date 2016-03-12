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
        return function define(prop, func) {
            return defineOnObj(that, prop, func);
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
        desc.writable = (val === undefined) ? true : !!val;
        return this;
    }
    
    function getter(val) {
        if (typeof val !== 'function') {
            return this;
        }
        
        delete desc.writable;
        desc.get = val;
        return this;
    }
    function setter(val) {
        if (typeof val !== 'function') {
            return this;
        }
        
        delete desc.writable;
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
            configurable: configurable,
            enumerable: enumerable,
            writable: writable
        };
        
        Object.defineProperty(andObj, 'not', {
            enumebrale: true,
            get: function() {
                return not();
            }
        });
        
        return andObj;
    }
    
    function not() {
        var notObj = {
            configurable: negative(configurable),
            enumerable: negative(enumerable),
            writable: negative(writable)
        };
        
        Object.defineProperty(notObj, 'and', {
            enumebable: true,
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
    define('get', getter);
    define('set', setter);

    defineOnObj(this, 'and', and());
    defineOnObj(this, 'not', not());
    
    define('return', ret);
    
    this.desc = desc;
}

module.exports = function propertyBuilder(obj) {
    return new Builder(obj, {});
};
