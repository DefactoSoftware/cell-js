import sinonChai from "sinon-chai";
import { stub, spy } from "sinon";
import { JSDOM } from "jsdom";
import chai, { expect } from "chai";

import Cell from "../src/Cell";

chai.use(sinonChai);

describe("Cell", () => {
  let window;
  let document;

  beforeEach(() => {
    const { window: newWindow } = new JSDOM(
      "<!doctype html><html><body></body></html>"
    );

    const { document: newDocument } = newWindow;

    window = newWindow;
    document = newDocument;
  });

  function createCellElement(params = {}, prefix) {
    const element = document.createElement("div");

    element.setAttribute("data-cell-params", params);

    if (prefix) {
      element.setAttribute("data-cell-prefix", prefix);
    }

    return element;
  }

  describe("#constructor()", () => {
    it("it accepts an element with cell parameters", () => {
      const element = createCellElement("{}");

      expect(new Cell(element)).to.be.an.instanceOf(Cell);
    });

    it("throws an error if constructor doesn't receive an element", () => {
      expect(() => new Cell("")).to.throw(
        "Cell requires a valid DOM element to initialize"
      );
    });

    it("sets params when valid parameters have been set", () => {
      const element = createCellElement(`{ "name": "Jesse" }`);
      const cell = new Cell(element);

      expect(cell.params).to.deep.equal({ name: "Jesse" });
    });

    it("sets the prefix when a valid prefix has been set", () => {
      const element = createCellElement(`{}`, "CSS");
      const cell = new Cell(element);

      expect(cell._prefix).to.equal("CSS");
    });

    it("throws when invalid parameters have been set", () => {
      const element = createCellElement("hallo");

      expect(() => new Cell(element)).to.throw(SyntaxError, /Unexpected token/);
    });
  });

  describe("#reload()", () => {
    it("calls the #contructor() with the new element", () => {
      const element = createCellElement("{}");
      const newElement = createCellElement("{}");
      const cell = new Cell(element);

      const constructor = stub(cell, "constructor");

      cell.constructor = constructor;

      cell.reload(newElement);

      expect(constructor).to.have.been.calledWith(newElement);

      constructor.restore();
    });

    it("calls the #onReload() hook if set", () => {
      const element = createCellElement("{}");
      const cell = new Cell(element);
      const onReload = spy();

      cell.onReload = onReload;

      cell.reload(element);

      expect(onReload).to.be.calledWith(element);

      cell.onReload = undefined;
    });

    it("returns the element that is reloaded", () => {
      const element = createCellElement("{}");
      const newElement = createCellElement("{}");
      const cell = new Cell(element);

      expect(cell.reload(element)).to.eq(element);
    });
  });

  describe("#destroy()", () => {
    it("sets the element to null", () => {
      const element = createCellElement("{}");
      const cell = new Cell(element);

      cell.destroy();

      expect(cell.element).to.eq(null);
    });

    it("calls the #onDestroy() hook if set", () => {
      const element = createCellElement("{}");
      const cell = new Cell(element);

      const onDestroy = spy();

      cell.onDestroy = onDestroy;
      cell.destroy();

      expect(onDestroy).to.be.calledWith(element);

      cell.onDestroy = undefined;
    });

    it("returns the element that is destroyed", () => {
      const element = createCellElement("{}");
      const newElement = createCellElement("{}");
      const cell = new Cell(element);

      expect(cell.destroy()).to.eq(element);
    });
  });

  describe("#prefix()", () => {
    it("returns a namespaced className", () => {
      const element = createCellElement("{}", "css_");
      const cell = new Cell(element);

      expect(cell.prefix("child")).to.eq("css_child");
    });

    it("returns no namespaced className if prefix not set", () => {
      const element = createCellElement("{}");
      const cell = new Cell(element);

      expect(cell.prefix("child")).to.eq("child");
    });
  });

  describe("#query()", () => {
    it("query's the element", () => {
      const element = createCellElement("{}");
      const querySelector = stub(element, "querySelector");

      const cell = new Cell(element);

      cell.query(".name");

      expect(querySelector).to.have.been.calledWith(".name");

      querySelector.restore();
    });
  });

  describe("#queryScoped()", () => {
    it("query's the element", () => {
      const element = createCellElement("{}", "css_");
      const querySelector = stub(element, "querySelector");

      const cell = new Cell(element);

      cell.queryScoped("name");

      expect(querySelector).to.have.been.calledWith(".css_name");

      querySelector.restore();
    });
  });

  describe("#queryAll()", () => {
    it("query's the element", () => {
      const element = createCellElement("{}");
      const querySelectorAll = stub(
        element,
        "querySelectorAll"
      ).callsFake(() => []);

      const cell = new Cell(element);

      cell.queryAll(".name");

      expect(querySelectorAll).to.have.been.calledWith(".name");

      querySelectorAll.restore();
    });
  });

  describe("#queryScopedAll()", () => {
    it("query's the element", () => {
      const element = createCellElement("{}", "css_");
      const querySelectorAll = stub(
        element,
        "querySelectorAll"
      ).callsFake(() => []);

      const cell = new Cell(element);

      cell.queryScopedAll("name");

      expect(querySelectorAll).to.have.been.calledWith(".css_name");

      querySelectorAll.restore();
    });
  });
});
