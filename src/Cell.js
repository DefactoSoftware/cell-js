import isElement from "./helpers/isElement";

/**
 * Class representing a cell which
 */
export default class Cell {
  /**
   * Parses the cell parameters and returns the JSON
   * @param  {HTMLElement} element
   * @return {JSON}
   */
  static getParameters(element) {
    const params = element.getAttribute("data-cell-params");
    return JSON.parse(params || "{}");
  }

  /**
   * Create a new cell by adding an element. The element requires
   * a data attr params to set its params.
   *
   * @param  {HTMLElement} element an element with a `data-params` attribute
   * @return {Cell}
   */
  constructor(element) {
    if (!isElement(element)) {
      throw new Error("Cell requires a valid DOM element to initialize");
    }

    this.element = element;
    this.name = this.constructor.name;
    this.params = Cell.getParameters(element);
  }

  /**
   * Dummy method that is used to call the onReload hook that can be defined
   * on an extended class.
   * @param  {HTMLElement} element
   * @return {HTMLElement}
   */
  reload(element = this.element) {
    this.constructor(element);

    this.onReload && this.onReload(element);

    return element;
  }

  /**
   * Teardown function of the Cell element, ensures that the element is removed
   * from the object so it can be marked for garbage collection.
   *
   * This method is a hook used by the Cell Builder, the element argument is
   * input by the Cell Builder so the user can be used for custom tear down.
   *
   * Super must be called when this method is overridden.
   *
   * @param  {HTMLElement} element
   * @return {HTMLElement}
   */
  destroy() {
    const { element } = this;

    this.element = null;

    this.onDestroy && this.onDestroy(element);

    return element;
  }

  /**
   * Constructs a namespaced className
   *
   * @param  {String} child
   * @return {String}
   */
  className(child) {
    const { name } = this;

    if (!child) {
      return `.${name}`;
    }

    return `.${name}__${child}`;
  }

  /**
   * jQuery like method to call custom class name selectors on the object by
   * automatically namespacing them to ensure the elements are unique enough
   * to be used.
   *
   * @param  {String} selector
   * @return {HTMLElement[]}
   */
  query(selector) {
    const { element } = this;

    return element.querySelector(selector);
  }

  /**
   * jQuery like method to call custom class name selectors on the object by
   * automatically namespacing them to ensure the elements are unique enough
   * to be used.
   *
   * @param  {String} selector
   * @return {HTMLElement}
   */
  queryAll(selector) {
    const { element } = this;

    return element.querySelectorAll(selector);
  }
}
