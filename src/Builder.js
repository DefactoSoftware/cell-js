/**
 * Cell Builder singleton that manages the initialization and teardown of cells
 * existing in the application.
 *
 * @type {Object}
 */
export default {
  /**
   * The cells currently active on the page
   * @type {Cell[]}
   */
  activeCells: [],

  /**
   * The cells classes that are registered the the register method
   * @type {Object[]}
   */
  availableCells: {},

  /**
   * Register a new cell class
   * @param  {Cell} cell
   */
  register(cell) {
    const cellName = cell.name;

    if (this.availableCells[cellName]) {
      return;
    }

    this.availableCells[cellName] = cell;
  },

  /**
   * Do an initial render of the cells available on the page
   */
  initialize() {
    this.reload();
  },

  /**
   * Inititialize new cells, teardown the removed cells and reload existing
   * cells.
   */
  reload() {
    const found = this.findAndBuild();

    this.destroyOrphans(found);

    this.activeCells = found;
  },

  /**
   * Destroy the orphan cells by inputting the cells currently found on the page
   *
   * @param  {Cell[]} found Cells that are currently present on the page
   * @return {Cell[]}       Cells that are marked for removal
   */
  destroyOrphans(found) {
    return this.activeCells.filter(cell => {
      if (!this.findByElement(cell.element, found)) {
        cell.destroy();

        return true;
      }

      return false;
    });
  },

  /**
   * Find and build or relaod cells currently available on the page
   *
   * @return {Cell[]}
   */
  findAndBuild() {
    return [].map.call(document.querySelectorAll("[data-cell]"), element => {
      const cellName = this.getCellName(element);
      const cellConstructor = this.availableCells[cellName];
      const foundCell = this.findByElement(element);

      if (!cellConstructor) {
        console &&
          console.warn &&
          console.warn(`Cell with name ${cellName} not found`);

        return;
      }

      if (foundCell) {
        foundCell.reload(element);

        return foundCell;
      }

      return new cellConstructor(element);
    });
  },

  /**
   * Find a cell by its element
   *
   * @param  {HTMLElement} element
   * @param  {[Cells[]]}   [cells=this.activeCells]
   * @return {Cells[]}
   */
  findByElement(element, cells = this.activeCells) {
    return cells.find(cell => cell.element === element);
  },

  getCellName(element) {
    return element.getAttribute("data-cell");
  }
};
