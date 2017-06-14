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
      const Cell = { constructorName: "Cell" };
      Builder.register(Cell);

      expect(Builder.availableCells).to.eql({ Cell });
    });

    it("ignores registering an existing cell", () => {
      const Cell = { constructorName: "Cell" };

      Builder.availableCells[Cell.constructorName] = Cell;
      Builder.register(Cell);

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
      const found = ["foo", "bar"];
      const findAndBuild = stub(Builder, "findAndBuild").returns(found);
      const destroyOrphans = stub(Builder, "destroyOrphans");

      Builder.reload();

      expect(destroyOrphans).to.have.been.calledWith(found);
      expect(Builder.activeCells).to.eq(found);

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
      const found = [activeCell];

      Builder.activeCells = [activeCell, inactiveCell];

      expect(Builder.destroyOrphans(found)).to.eql([inactiveCell]);
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
      const activeCell = { element: activeElement, reload: stub() };

      Builder.availableCells = { Cell };
      Builder.activeCells = [activeCell];

      expect(Builder.findAndBuild()).to.eql([newCell, activeCell]);

      expect(Cell).to.have.been.calledWith(newElement);
      expect(activeCell.reload).to.have.been.calledWith(activeElement);
    });

    it("shows a warning if a cell doesn't exist", () => {
      const newElement = createCellElement("{}");

      const warn = stub(console, "warn");

      Builder.findAndBuild();

      expect(warn).to.have.been.calledWith("Cell with name Cell not found");
    });
  });
});
