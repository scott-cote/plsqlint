

var Parser = function() {

  var rules, parseTable, input, stack;

  var nodeCount = 0;

  var shift = function(newState) {
    return function(token, type) {
      var top = stack[stack.length-1];
      //console.log('shift to '+newState);
      stack.push(parseTable[newState]);
      console.log('LEAF '+type+' '+token+' '+(++nodeCount))
      return true;
    };
  };

  var reduce = function(ruleIndex) {
    return function(token, type) {
      var top = stack[stack.length-1];
      var rule = rules[ruleIndex-1];
      //console.log('reduce using rule '+ruleIndex);
      //console.log('removing from stack '+rule.rightCount);
      stack.splice(-rule.rightCount, rule.rightCount)
      top = stack[stack.length-1];
      //console.log(JSON.stringify(rule))
      input.push({ content: '', type: rule.left });
    };
  };

  var goto = function(newState) {
    return function(token, type) {
      var top = stack[stack.length-1];
      //console.log('goto '+newState);
      stack.push(parseTable[newState]);
      console.log('TRUNK '+type+' '+token+' '+(++nodeCount))
      return true;
    };
  };

  var accept = function() {
    return function(token, type) {
      console.log('ROOT');
      return true;
    };
  }

  rules = [
    { left: 'RULES', rightCount: 2 }, // RULES -> RULES RULE;
    { left: 'RULES', rightCount: 1 }, // RULES -> RULE;
    { left: 'RULE', rightCount: 4 }, // RULE -> LEFT TOKEN_ROCKET RIGHT TOKEN_SEMICOLON;
    { left: 'LEFT', rightCount: 1 }, // LEFT -> TOKEN_IDENTIFIER;
    { left: 'RIGHT', rightCount: 2 }, // RIGHT -> RIGHT TOKEN_IDENTIFIER;
    { left: 'RIGHT', rightCount: 1 } // RIGHT -> TOKEN_IDENTIFIER;
  ];

  parseTable = [
    {"RULES":goto(2),"RULE":goto(3),"LEFT":goto(4),"TOKEN_IDENTIFIER":shift(1),"state":0},
    {"TOKEN_ROCKET":reduce(4),"state":1},
    {"RULE":goto(5),"LEFT":goto(4),"$":accept(),"TOKEN_IDENTIFIER":shift(1),"state":2},
    {"$":reduce(2),"TOKEN_IDENTIFIER":reduce(2),"state":3},
    {"TOKEN_ROCKET":shift(6),"state":4},
    {"$":reduce(1),"TOKEN_IDENTIFIER":reduce(1),"state":5},
    {"RIGHT":goto(8),"TOKEN_IDENTIFIER":shift(7),"state":6},
    {"TOKEN_SEMICOLON":reduce(6),"TOKEN_IDENTIFIER":reduce(6),"state":7},
    {"TOKEN_SEMICOLON":shift(9),"TOKEN_IDENTIFIER":shift(10),"state":8},
    {"$":reduce(3),"TOKEN_IDENTIFIER":reduce(3),"state":9},
    {"TOKEN_SEMICOLON":reduce(5),"TOKEN_IDENTIFIER":reduce(5),"state":10}
  ];

  stack = [parseTable[0]];

  var error = function() {
    throw 'error';
  }

  this.processToken = function(content, type) {
    input = [{ content, type }];
    while (input.length) {
      //console.log(JSON.stringify(input));
      //console.log(JSON.stringify(stack));
      var symbol = input[input.length-1];
      var top = stack[stack.length-1];
      //console.log('in state '+top.state);
      //console.log('encountered '+symbol.type);
      if ((stack[stack.length-1][symbol.type]||error)(symbol.content, symbol.type)) {
        input.pop();
      }
    }
  };

  this.end = function() {
    //console.log('end')
    this.processToken('', '$');
  }
};

exports.default = Parser;

