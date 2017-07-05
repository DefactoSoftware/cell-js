import MicroEvent from "microevent";
import isElement from "./helpers/is_element";

/**
 * Class representing a cell which
 */
export default class Cell extends MicroEvent {
  /**
   * Parses the cell parameters and returns the JSON
   * @param  {HTMLElement} element
   * @return {JSON}
   */
  static getParameters(element) {
    const params = element.getAttribute("data-cell-params");
    return JSON.parse(params || "{}");
  }

  static getPrefix(element) {
    return element.getAttribute("data-cell-prefix");
  }

  static constructorName = "Cell";

  /**
   * Create a new cell by adding an element. The element requires
   * a data attr params to set its params.
   *
   * @param  {HTMLElement} element an element with a `data-params` attribute
   * @return {Cell}
   */
  constructor(element) {
    super(...arguments);

    if (!isElement(element)) {
      throw new Error("Cell requires a valid DOM element to initialize");
    }

    this.element = element;
    this.params = Cell.getParameters(element);
    this._prefix = Cell.getPrefix(element) || "";
  }

  addEventListener(event, callback) {
    this.bind(event, callback);
  }

  removeEventListener(event, callback) {
    this.unbind(event, callback);
  }

  dispatchEvent(event, ...args) {
    this.trigger(event, ...args);
  }

  /**
   * Dummy method that is used to call the onReload hook that can be defined
   * on an extended class.
   * @param  {HTMLElement} element
   * @return {HTMLElement}
   */
  reload(element = this.element) {
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
   * @param  {String} target
   * @return {String}
   */
  prefix(target) {
    const { _prefix } = this;

    if (_prefix) {
      return `${_prefix}${target}`;
    }

    return `${target}`;
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

  queryScoped(target) {
    return this.query(`.${this.prefix(target)}`);
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

    return [].slice.call(element.querySelectorAll(selector));
  }

  queryScopedAll(target) {
    return this.queryAll(`.${this.prefix(target)}`);
  }
}
