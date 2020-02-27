import sinonChai from "sinon-chai";
import { spy, stub } from "sinon";
import { JSDOM } from "jsdom";
import chai, { expect } from "chai";

import Builder from "../src/Builder";

chai.use(sinonChai);

describe("Builder", () => {
  let window;
  let document;

  beforeEach(() => {
    const { window: newWindow } = new JSDOM(
      "<!doctype html><html><body></body></html>"
    );

    const { document: newDocument } = newWindow;

    window = newWindow;
    document = newDocument;
    global.window = newWindow;
    global.document = newDocument;
  });

  afterEach(() => {
    Builder.activeCells = [];
    Builder.availableCells = {};
  });

  function createCellElement(params) {
    const element = document.createElement("div");

    document.body.appendChild(element);
    element.setAttribute("data-cell", "Cell");
    element.setAttribute("data-cell-params", params);

    return element;
  }

  describe("#register()", () => {
    it("registers a new cell", () => {
      const Cell = {};
      Builder.register(Cell, "Cell");

      expect(Builder.availableCells).to.eql({ Cell });
    });

    it("ignores registering an existing cell", () => {
      const Cell = {};

      Builder.availableCells["Cell"] = Cell;
      Builder.register(Cell, "Cell");

      expect(Builder.availableCells).to.eql({ Cell });
    });
  });

  describe("#initialize()", () => {
    it("calls reload", () => {
      const reload = stub(Builder, "reload");

      Builder.initialize();

      expect(reload).to.have.been.called;

      reload.restore();
    });
  });

  describe("#reload()", () => {
    it("calls findAndBuild and resets activeCells", () => {
      const existingCell = {
        reload: stub(),
        initialized: true
      };

      const newCell = {
        initialize: stub()
      };

      const previous = [existingCell];
      const found = [existingCell, newCell];
      const findAndBuild = stub(Builder, "findAndBuild").returns(found);
      const destroyOrphans = stub(Builder, "destroyOrphans");

      Builder.activeCells = previous;
      Builder.reload();

      expect(destroyOrphans).to.have.been.calledWith(previous, found);
      expect(Builder.activeCells).to.eq(found);

      expect(existingCell.reload).to.have.been.called;
      expect(newCell.initialize).to.have.been.called;
      expect(newCell.initialize).have.been.calledAfter(destroyOrphans);

      findAndBuild.restore();
      destroyOrphans.restore();
    });
  });

  describe("#destroyOrphans()", () => {
    it("it calls destroy on active cells that are no longer present", () => {
      const activeElement = createCellElement("{}");
      const inactiveElement = createCellElement("{}");
      const activeCell = { element: activeElement, destroy: spy() };
      const inactiveCell = {
        element: inactiveElement,
        destroy: spy()
      };

      expect(Builder.destroyOrphans([inactiveCell], [activeCell])).to.eql([
        inactiveCell
      ]);

      expect(activeCell.destroy).to.not.have.been.called;
      expect(inactiveCell.destroy).to.have.been.called;
    });
  });

  describe("#findAndBuild()", () => {
    it("finds all and builds elements with a [data-cell] attribute and reloads existing", () => {
      const newElement = createCellElement("{}");
      const newCell = { element: newElement };
      const Cell = stub().returns(newCell);

      const activeElement = createCellElement("{}");
      const activeCell = {
        element: activeElement
      };

      Builder.availableCells = { Cell };
      Builder.activeCells = [activeCell];

      expect(Builder.findAndBuild()).to.eql([newCell, activeCell]);
    });
  });
});
