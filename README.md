# cell-js

Simple and lightweight solution for binding Javascript to specific templates or side server components.  
We use this alongside [ex_cell](https://github.com/DefactoSoftware/ex_cell), an Elixir/Phoenix module for coupling Javascript, CSS, Javascript and Views.

## Installation

```
npm install @defacto/cell-js
```

or

```
yarn add @defacto/cell-js
```

## Usage

```js
import { Cell, Builder } from "cells-js";

class AvatarCell extends Cell {
  initialize() {
    this.element.addEventListener("click", this.onToggleOpenClass);
  }

  onToggleOpenClass = e => this.element.classList.toggle("open");
}

Builder.register(AvatarCell, "AvatarCell");

export default AvatarCell;
```

For a more complete implementation see [ex_cell](https://github.com/DefactoSoftware/ex_cell).
