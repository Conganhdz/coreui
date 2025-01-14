/**
 * --------------------------------------------------------------------------
 * CoreUI (v4.0.0-rc.0): alert.js
 * Licensed under MIT (https://coreui.io/license)
 *
 * This component is a modified version of the Bootstrap's base-component.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import Data from './dom/data'
import EventHandler from './dom/event-handler'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const VERSION = '4.0.0-rc.0'

class BaseComponent {
  constructor(element) {
    element = typeof element === 'string' ? document.querySelector(element) : element

    if (!element) {
      return
    }

    this._element = element
    Data.set(this._element, this.constructor.DATA_KEY, this)
  }

  dispose() {
    Data.remove(this._element, this.constructor.DATA_KEY)
    EventHandler.off(this._element, `.${this.constructor.DATA_KEY}`)
    this._element = null
  }

  /** Static */

  static getInstance(element) {
    return Data.get(element, this.DATA_KEY)
  }

  static get VERSION() {
    return VERSION
  }
}

export default BaseComponent
