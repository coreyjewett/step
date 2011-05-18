require('./helper');

var selfText = fs.readFileSync(__filename, 'utf8');

// Example tests sharing a memento object to all layers.

expect('one');
expect('two');
expect('three');
Step(
  function readSelf() {
    fulfill("one");
    fs.readFile(__filename, 'utf8', this);
  },
  function capitalize(err, text) {
    fulfill("two");
    if (err) throw err;
    assert.equal(selfText, text, "Text Loaded");
    this.memento['downcase'] = text.toLowerCase();
    return text.toUpperCase();
  },
  function showIt(err, newText) {
    fulfill("three");
    if (err) throw err;
    assert.equal(selfText.toUpperCase(), newText, "Text Uppercased");
    assert.deepEqual(this.memento.hai, 'IHazContext');
    assert.deepEqual(this.memento.downcase, newText.toLowerCase());
  },
  {hai: "IHazContext"}
);

// default memento
expect('empty');
expect('andthen');
Step(
  function() {
    fulfill("empty");
    assert.deepEqual(this.memento, {});
    this.memento.had_empty_default = true;
    return this;
  },
  function() {
    fulfill("andthen");
    assert.deepEqual(this.memento, {had_empty_default: true});
  }
);

// parallel
expect('empty A');
expect('empty B');
expect('empty C');
expect('success');
Step(
  function() {
    fulfill("empty A");
    this.memento.A = true;
    fs.readFile(__filename, 'utf8', this.parallel());
  },
  function() {
    fulfill("empty B");
    this.memento.B = true;
    fs.readFile(__filename, 'utf8', this.parallel());
  },
  function() {
    fulfill("empty C");
    this.memento.C = true;
    fs.readFile(__filename, 'utf8', this.parallel());
  },
  function() {
    fulfill("success");
    assert.ok(this.memento.A);
    assert.ok(this.memento.B);
    assert.ok(this.memento.C);
    assert.deepEqual(this.memento, {A: true, B: true, C: true});
  }
);