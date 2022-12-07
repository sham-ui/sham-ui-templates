## 6.0.0-alpha.5
* Update dependencies

## 6.0.0-alpha.4
* Update dependencies

## 6.0.0-alpha.3
* Update dependencies

## 6.0.0-alpha.1
* Update browserslist 
* Move some blueprint codes from `for` compiler to runtime
* Changes hooks:
  `function FooComponent( options, didMount, didRecieve )`
  `didMount` can return function for `onRemove`
  `didRecieve` should call after new option set from outer component
  `options` return function with state. Now state will autocall update:
  ```
  const state = options( { foo: 42, bar: 56 } );
  state.foo = 31; // call update inner
  state( { foo: 78, bar: 93 } ) // call update once for multiple values
  ```
* Add new base entity - `context` for decrease compiled templates size & more robust api for directives & filters
* Add `{% debugger %}`

## 5.0.0
* Release

## 5.0.0-alpha.16
* Update dependencies

## 5.0.0-alpha.15
* Merge update for spread attributes with other attribute updates

## 5.0.0-alpha.14
* Generate unique name for block data
* Reduce generated code size for directives

## 5.0.0-alpha.13
* Fix update blocks data for spread attributes

## 5.0.0-alpha.12
* Update dependencies
* Fix visitor 
* Add pass data to blocks 
* Auto pass block data to component by default
* Reduce generated code for `{% defblock %}` 

## 5.0.0-alpha.11
* Update dependencies

## 5.0.0-alpha.10
* Update dependencies

## 5.0.0-alpha.9
* Add transformer for `{{this$.foo}}` expression (transform to `this[ ref('foo' )])`
* Upgrage code to new `sham-ui-macro`

## 5.0.0-alpha.8
* Fix `ForStatement`

## 5.0.0-alpha.7
* Update sham-ui-macro

## 5.0.0-alpha.6
* Update sham-ui

## 5.0.0-alpha.5
* Update sham-ui-macro & usage

## 5.0.0-alpha.4
* Update sham-ui-macro & usage

## 5.0.0-alpha.3
* Fix imports (now use ES imports all time)

## 5.0.0-alpha.2
* Update dependencies
* Extract configs from package.json

## 5.0.0-alpha.1
* Generate function for `Component` factory
* Changes for usage `ref` from `sham-ui-macro` 

## 5.0.0-alpha.0
* Remove patching `window` 
* Use create comments/text node/elements from `Dom` service
* Declare text node for support SSR (remove inlining)
* Use `dom.build` hook for construct dom (for rehydration support)
* Add variable definition syntax [#137](https://github.com/sham-ui/sham-ui-templates/issues/137)
* Minimize generated comment size
* Extract `{% unsafe %}` runtime to external package 

## 4.2.3
* Rebuild

## 4.2.2
* Fix incorrect resolve `owner` for usage block 

## 4.2.1
* Add escaping for specific identifiers: `<div \style="background-color: red"></div>`, `<div :\input="background-color: red"></div>`

## 4.2.0
* Move `updateSpots`, set defaults `__cache__`, `__data__` and prepare data for render blocks logic from template compiler to runtime [#123](https://github.com/sham-ui/sham-ui-templates/issues/123)

## 4.1.0
* Fix parsing `<script></script> content [#76](https://github.com/sham-ui/sham-ui-templates/issues/76)
* Fix work with class getters [#77](https://github.com/sham-ui/sham-ui-templates/issues/77)

## 4.0.2
* Fix pass options to block component after finish update

## 4.0.1
* Update `sham-ui`

## 4.0.0
* Generate ES6 class 
* Fix links to `sham-ui` repo
* Reimplement blocks for support update from block owner component ( block owner updated -> render block usage )
* Update `sham-ui`
* Remove unactual `thisRef`s
* Add `removeDataTest` compiler options 

## 3.2.5
* Update dependencies

## 3.2.4
* Update dependencies

## 3.2.3
* Update dependencies

## 3.2.2
* Add `.travis.yml` to `.npmignore`
* Update dependencies

## 3.2.1
* Update dependencies

## 3.2.0
* Support expression in `SpreadAttribute` & example for extending component template 

## 3.1.0
* Move common parts for `update` from `sham-ui-templates` to `sham-ui`
* Remove widget name from prototype

## 3.0.0
* Rename widget to component
* Update `sham-ui`
* [#9](https://github.com/sham-ui/sham-ui-templates/issues/9) Add support function bind operator

## 2.1.2
* Add SourceMap for script contents
* [#8](https://github.com/sham-ui/sham-ui-templates/issues/8) Fix incorrect resolve `this` in blocks

## 2.1.1
* [#7](https://github.com/sham-ui/sham-ui-templates/issues/7) Fix `{% import %}` in SFW 

## 2.1.0
* [#6](https://github.com/sham-ui/sham-ui-templates/issues/6) Add support for single file component

## 2.0.7
* Update dependencies
* Pass owner to directive constructor

## 2.0.6
* Update `yarn.lock`

## 2.0.5
* Fix override options in update

## 2.0.4
* Fix lose options descriptors after update

## 2.0.3
* Update `.npmignore`
* [#5](https://github.com/sham-ui/sham-ui-templates/issues/5) Dynamic blocks
* Add eslint
* Update dependencies
* Migrate tests to jest
* [#4](https://github.com/sham-ui/sham-ui-templates/issues/4) Pass widget to directive constructor 

## 0.0.16
Merge options with current state
Update dependency

## 0.0.15
Merge options with current state

## 0.0.14
Call `update` after `render` 

## 0.0.13
Auto merge current state with options

## 0.0.12
Update sham-ui@1.3.1

## 0.0.11
Fix import

## 0.0.10
Change name of `sham-ui-view.js` to `sham-ui-widget.js`

## 0.0.9
Change `browser` file

## 0.0.8
Change name of `sham-ui-view.js` to `view.js`

## 0.0.7
Export default ShamUIView

## 0.0.6
Import `widget` from package

## 0.0.5
Fix import from `sham-ui-templates/view` to `sham-ui-templates`
Add `bin` into `package.json`
