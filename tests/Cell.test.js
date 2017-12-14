import sinonChai from "sinon-chai";
import { stub, spy } from "sinon";
import { JSDOM } from "jsdom";
import chai, { expect } from "chai";

import Cell from "../src/Cell";
import MicroEvent from "microevent";

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
    element.setAttribute("data-cell-id", "foo");

    if (prefix) {
      element.setAttribute("data-cell-prefix", prefix);
    }

    return element;
  }

  function createCellChildElement(id, name) {
    const element = document.createElement("div");

    element.setAttribute("data-cell-parent-id", id);
    element.setAttribute("data-cell-element", name);

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

    it("collects child elements", () => {
      const element = createCellElement(`{}`, "CSS");
      const header = createCellChildElement("foo", "header");
      const articles = [
        createCellChildElement("foo", "articles"),
        createCellChildElement("foo", "articles")
      ];
      const footer = createCellChildElement("foo", "footer");

      const notChildElement = createCellChildElement("bar", "articles");

      element.appendChild(header);

      articles.forEach(article => element.appendChild(article));

      element.appendChild(footer);
      element.appendChild(notChildElement);

      const cell = new Cell(element);

      expect(cell.elements).to.eql({
        header: [header],
        articles,
        footer: [footer]
      });
    });

    it("throws when invalid parameters have been set", () => {
      const element = createCellElement("hallo");

      expect(() => new Cell(element)).to.throw(SyntaxError, /Unexpected token/);
    });
  });

  describe("#reload()", () => {
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
      const querySelectorAll = stub(element, "querySelectorAll").callsFake(
        () => []
      );

      const cell = new Cell(element);

      cell.queryAll(".name");

      expect(querySelectorAll).to.have.been.calledWith(".name");

      querySelectorAll.restore();
    });
  });

  describe("#queryScopedAll()", () => {
    it("query's the element", () => {
      const element = createCellElement("{}", "css_");
      const querySelectorAll = stub(element, "querySelectorAll").callsFake(
        () => []
      );

      const cell = new Cell(element);

      cell.queryScopedAll("name");

      expect(querySelectorAll).to.have.been.calledWith(".css_name");

      querySelectorAll.restore();
    });
  });

  describe("MicroEvent API", () => {
    it("calls the MicroEvent API", () => {
      const callback = stub();
      const element = createCellElement("{}");
      const cell = new Cell(element);

      cell.addEventListener("change", callback);
      cell.dispatchEvent("change", "value");
      cell.removeEventListener("change", callback);
      cell.dispatchEvent("change", "anothervalue");

      expect(callback).to.have.been.calledOnce;
      expect(callback).to.have.been.calledWithExactly("value");
    });
  });
});
