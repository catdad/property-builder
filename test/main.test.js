/* jshint node: true, mocha: true */

var util = require('util');
var expect = require('chai').expect;
var _ = require('lodash');

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

describe('[and]', function() {
    var gen = function() {
        return builder().and;
    };

    hasSubMethods(gen);
    hasObject('not', gen);
});

describe('[not]', function() {
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

function testBool(val, descKey, getKey) {
    var gen = function() {
        return builder();
    };
    
    describe(util.format('[%s]', getKey), function() {
        it(util.format('sets the default value of %s', val), function() {
            var method = _.get(gen(), getKey);
            var desc = method().description;
            
            expect(desc).to.have.property(descKey).and.to.equal(val);
        });
    });
}

function testPositiveBool(descKey, getKey) {
    testBool(true, descKey, getKey);
}

function testNegativeBool(descKey, getKey) {
    testBool(false, descKey, getKey);
}

var positiveBools = {
    'enumerable': 'enumerable',
    'and.enumerable': 'enumerable',
    'not.and.enumerable': 'enumerable',
    
    'writable': 'writable',
    'and.writable': 'writable',
    'not.and.writable': 'writable',
    
    'configurable': 'configurable',
    'and.configurable': 'configurable',
    'not.and.configurable': 'configurable',
};

_.forEach(positiveBools, testPositiveBool);

var negativeBools = {
    'not.enumerable': 'enumerable',
    'and.not.enumerable': 'enumerable',
    
    'not.writable': 'writable',
    'and.not.writable': 'writable',
    
    'not.configurable': 'configurable',
    'and.not.configurable': 'configurable',
};

_.forEach(negativeBools, testNegativeBool);
