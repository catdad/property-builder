/* jshint node: true */

function defineOnObj(obj, prop, val) {
    if (typeof val === 'function') {
        val.bind(obj);
    }

    obj[prop] = val;
}

function Builder(obj, desc) {
    if (!(this instanceof Builder)) {
        return Builder(obj, desc);
    }
    
    var builder = {};
    var prop;
    desc = desc || {};
    
    function define(prop, val) {
        return defineOnObj(builder, prop, val);
    }
    
    function property(val) {
        prop = val;
        return builder;
    }
    
    function configurable(val) {
        desc.configurable = (val === undefined) ? true : !!val;
        return builder;
    }
    
    function enumerable(val) {
        desc.enumerable = (val === undefined) ? true : !!val;
        return builder;
    }
    
    function writable(val) {
        delete desc.get;
        delete desc.set;
        
        desc.writable = (val === undefined) ? true : !!val;
        return builder;
    }
    
    function value(val) {
        desc.value = val;
        return builder;
    }
    
    function getter(val) {
        if (typeof val !== 'function') {
            return builder;
        }
        
        delete desc.writable;
        delete desc.value;
        
        desc.get = val;
        return builder;
    }
    function setter(val) {
        if (typeof val !== 'function') {
            return builder;
        }
        
        delete desc.writable;
        delete desc.value;
        
        desc.set = val;
        return builder;
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

    defineOnObj(builder, 'and', and());
    defineOnObj(builder, 'not', not());
    
    builder.description = desc;
    
    return builder;
}

module.exports = function propertyBuilder(obj) {
    return new Builder(obj, {});
};
