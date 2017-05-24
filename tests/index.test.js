import { expect } from "chai";
import * as index from "../src/";
import Builder from "../src/Builder";
import Cell from "../src/Cell";

describe("index", () => {
  it("exports the Builder class", () => {
    expect(index.Builder).to.equal(Builder);
  });

  it("exports the Cell class", () => {
    expect(index.Cell).to.equal(Cell);
  });
});
