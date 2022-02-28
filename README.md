# recursive-transform

Manipulating immutable data structures provides many benefits but at times
bring some extra complexity. Recursive data structure containing loops are
not always easy to manipulate without getting into infinit loops.

This library provides a generic way to manipulate immutable data structures
which have loops.

## Examples

### Deep clone

```javascript

const { recursiveTransform } = require('recursive-transform')

const parent = { name: 'foo', children: new Set(), parent: undefined }
const child = { name: 'bar', children: new Set(), parent: undefined }

// setting up circular relationship
parent.children.add(child)
child.parent = parent

const copy = recursiveTransform(parent, (obj, transform) => {
  // Step 1: initialize the new object.
  const result = { name: obj.name, children: new Set() }
  
  // Step 2: populate properties that could be part of a loop
  if (obj.parent) {
    transform(obj.parent, r => result.parent = r)
  }

  obj.children.forEach(c => transform(c, r => result.children.add(r)))

  // Step 3: return result
  return result
})

console.log(copy === parent)
// false

console.log(copy)
/*
<ref *1> {
  name: 'foo',
  children: Set(1) {
    { name: 'bar', children: Set(0) {}, parent: [Circular *1] }
  }
}
*/

```

Note: for this use case, in practice we would use this library to build a more generic
cloning algorithm that enumerates the properties and does the right thing depending on
their types. This example can be useful in practice if you do not want to copy only a subset
of the properties.

### Adding id properties

```javascript

const { recursiveTransform } = require('recursive-transform')

const node = { next: { next: { next: {} } } }
node.next.next.next = node // beautiful loop :)

let counter = 0 
const withIds = recursiveTransform(node, (obj, transform) => {
  // Step 1: initialize the new object.
  const result = { id: counter++ }
  
  // Step 2: populate properties that could be part of a loop
  transform(obj.next, r => result.next = r)

  // Step 3: return result
  return result
})

console.log(node)
// <ref *1> { next: { next: { next: [Circular *1] } } }
console.log(withIds)
/*
<ref *1> {
  id: 0,
  next: { id: 1, next: { id: 2, next: [Circular *1] } }
}
*/

```

### Convert property types

```javascript

const { recursiveTransform } = require('recursive-transform')

// Here children are a Set
const parent = { name: 'foo', children: new Set(), parent: undefined }
const child = { name: 'bar', children: new Set(), parent: undefined }

// setting up circular relationship
parent.children.add(child)
child.parent = parent

const copy = recursiveTransform(parent, (obj, transform) => {
  // Step 1: initialize the new object. Note that children is now an array
  const result = { name: obj.name, children: [] }
  
  // Step 2: populate properties that could be part of a loop
  if (obj.parent) {
    transform(obj.parent, r => result.parent = r)
  }

  obj.children.forEach(c => transform(c, r => result.children.push(r)))

  // Step 3: return result
  return result
})

console.log(parent)
/*
<ref *1> {
  name: 'foo',
  children: Set(1) {
    { name: 'bar', children: Set(0) {}, parent: [Circular *1] }
  },
  parent: undefined
}
*/

console.log(copy)
/*
<ref *1> {
  name: 'foo',
  children: [ { name: 'bar', children: [], parent: [Circular *1] } ],
  parent: undefined
}
*/

```

### Create back references

```javascript

const { recursiveTransform } = require('recursive-transform')

const node = { next: { next: { next: {} } } }
node.next.next.next = node // beautiful loop :)

const withIds = recursiveTransform(node, (obj, transform) => {
  // Step 1: initialize the new object.
  const result = { }
  
  // Step 2: populate properties that could be part of a loop
  transform(obj.next, r => { 
    result.next = r;
    r.previous = result
  })

  // Step 3: return result
  return result
})

console.log(node)
// <ref *1> { next: { next: { next: [Circular *1] } } }
console.log(withIds)
// Note how console.log does not manage to properly print this data structure, two objects are being printed twice.
/*
<ref *2> {
  next: <ref *1> {
    next: { previous: [Circular *1], next: [Circular *2] },
    previous: [Circular *2]
  },
  previous: <ref *3> {
    previous: <ref *1> { next: [Circular *3], previous: [Circular *2] },
    next: [Circular *2]
  }
}
*/

```
