/* jshint node: true, mocha: true */

var util = require('util');
var expect = require('chai').expect;
var _ = require('lodash');

var PROP = 'thing';

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
    
    describe('in a full test case', function() {
        it('can set properties on the object', function() {
            var obj = {};

            var mod = get()(obj).property(PROP)
                .enumerable()
                .and.not.writable()
                .value('jello')
                .return();

            expect(mod).to.equal(obj);
            expect(mod).to.have.property(PROP).and.to.equal('jello');

            mod.thing = 'not jello';

            expect(mod).to.have.property(PROP).and.to.equal('jello');
        });
        
        it('can define a getter method', function() {
            var testVal = 'lemon';
            
            var obj = get()({}).property(PROP).get(function() {
                return testVal;
            }).return();
            
            expect(obj).to.have.property(PROP).and.to.equal('lemon');
            
            testVal = 'not lemon';
            
            expect(obj).to.have.property(PROP).and.to.equal('not lemon');
        });
        
        it('can define a setter method', function() {
            var testVal = 'pork';
            
            var obj = get()({}).property(PROP).set(function(val) {
                expect(val).to.equal(testVal);
            }).return();
            
            obj[PROP] = testVal;
            
            testVal = 'not pork';
            
            obj[PROP] = testVal;
        });
        
        it('can define an enumerable property', function() {
            var obj = get()({}).property(PROP).enumerable().return();
            
            expect(obj).to.have.property(PROP);
            var keys = Object.keys(obj);
            expect(keys).to.contain(PROP);
        });
        
        it('can define a non-enumerable property', function() {
            var obj = get()({}).property(PROP).not.enumerable().return();
            
            expect(obj).to.have.property(PROP);
            var keys = Object.keys(obj);
            expect(keys).to.not.contain(PROP);
        });
    });
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

describe('[boolean descriptor methods]', function() {
    // builder method: property in the description
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

    var negativeBools = {
        'not.enumerable': 'enumerable',
        'and.not.enumerable': 'enumerable',

        'not.writable': 'writable',
        'and.not.writable': 'writable',

        'not.configurable': 'configurable',
        'and.not.configurable': 'configurable',
    };
    
    var longestKey = _.reduce(_.extend({}, positiveBools, negativeBools), function(seed, val, key) {
        if (key.length > seed) {
            return key.length;
        }
        
        return seed;
    }, 0);
    
    function addLength(val, len) {
        while(val.length < len) {
            val += ' ';
        }
        
        return val;
    }

    function testBool(val, descKey, getKey) {
        var gen = function() {
            return builder();
        };

        it(util.format(
            '#%s : sets the default value of %s',
            addLength(getKey, longestKey),
            val
        ), function() {
            var method = _.get(gen(), getKey);
            var desc = method().description;

            expect(desc).to.have.property(descKey).and.to.equal(val);
        });
    }
    
    _.forEach(positiveBools, function testPositiveBool(descKey, getKey) {
        testBool(true, descKey, getKey);
    });
    _.forEach(negativeBools, function testNegativeBool(descKey, getKey) {
        testBool(false, descKey, getKey);
    });
});

