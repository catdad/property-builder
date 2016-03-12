/* jshint node: true, mocha: true */

var util = require('util');
var expect = require('chai').expect;

function get() {
    return require('../index');
}

function builder() {
    return get()({});
}

function hasMethods(list, gen) {
    list.forEach(function(val) {
        it(util.format('has function "%s"', val), function() {
            var obj = gen();
            expect(obj).to.have.property(val).and.to.be.a('function');
        });
    });
}

function hasObject(prop, gen) {
    it(util.format('has a property "%s"', prop), function() {
        var obj = gen();
        expect(obj).to.have.property(prop).and.to.be.an('object');
    });
}

function hasAllMethods(gen) {
    var list = [
        'property',
        'configurable',
        'enumerable',
        'writable',
        'value',
        'get',
        'set',
        'return',
    ];
    
    hasMethods(list, gen);
}

function hasSubMethods(gen) {
    var list = [
        'enumerable', 'configurable', 'writable'
    ];
    
    hasMethods(list, gen);
}


describe('[Builder]', function() {
    var gen = function() {
        return builder();
    };
    
    hasAllMethods(gen);
    hasObject('and', gen);
    hasObject('not', gen);
});

describe('[And]', function() {
    var gen = function() {
        return builder().and;
    };

    hasSubMethods(gen);
    hasObject('not', gen);
});

describe('[Not]', function() {
    var gen = function() {
        return builder().not;
    };
    
    hasSubMethods(gen);
    hasObject('and', gen);
    
    it('negates the default enumerable value', function() {
        var desc = builder().not.enumerable().description;
        
        expect(desc).to.have.property('enumerable').and.to.equal(false);
    });
});
