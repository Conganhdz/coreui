import Modal from '../../src/modal'
import EventHandler from '../../src/dom/event-handler'
import { getWidth as getScrollBarWidth } from '../../src/util/scrollbar'

/** Test helpers */
import { clearBodyAndDocument, clearFixture, createEvent, getFixture, jQueryMock } from '../helpers/fixture'

describe('Modal', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
    clearBodyAndDocument()
    document.body.classList.remove('modal-open')

    document.querySelectorAll('.modal-backdrop')
      .forEach(backdrop => {
        document.body.removeChild(backdrop)
      })
  })

  beforeEach(() => {
    clearBodyAndDocument()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Modal.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(Modal.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Modal.DATA_KEY).toEqual('coreui.modal')
    })
  })

  describe('constructor', () => {
    it('should take care of element either passed as a CSS selector or DOM element', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modalBySelector = new Modal('.modal')
      const modalByElement = new Modal(modalEl)

      expect(modalBySelector._element).toEqual(modalEl)
      expect(modalByElement._element).toEqual(modalEl)
    })
  })

  describe('toggle', () => {
    it('should toggle a modal', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      document.documentElement.style.overflowY = 'scroll'
      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)
      const originalPadding = '0px'

      document.body.style.paddingRight = originalPadding

      modalEl.addEventListener('shown.coreui.modal', () => {
        expect(document.body.getAttribute('data-coreui-padding-right')).toEqual(originalPadding, 'original body padding should be stored in data-coreui-padding-right')
        modal.toggle()
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        expect(document.body.getAttribute('data-coreui-padding-right')).toBeNull()
        expect().nothing()
        document.documentElement.style.overflowY = 'auto'
        done()
      })

      modal.toggle()
    })

    it('should adjust the inline padding of fixed elements when opening and restore when closing', done => {
      fixtureEl.innerHTML = [
        '<div class="fixed-top" style="padding-right: 0px"></div>',
        '<div class="modal"><div class="modal-dialog"></div></div>'
      ].join('')

      document.documentElement.style.overflowY = 'scroll'
      const fixedEl = fixtureEl.querySelector('.fixed-top')
      const originalPadding = Number.parseInt(window.getComputedStyle(fixedEl).paddingRight, 10)
      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)
      const scrollBarWidth = getScrollBarWidth()

      modalEl.addEventListener('shown.coreui.modal', () => {
        const expectedPadding = originalPadding + scrollBarWidth
        const currentPadding = Number.parseInt(window.getComputedStyle(fixedEl).paddingRight, 10)

        expect(fixedEl.getAttribute('data-coreui-padding-right')).toEqual(`${originalPadding}px`, 'original fixed element padding should be stored in data-coreui-padding-right')
        expect(currentPadding).toEqual(expectedPadding, 'fixed element padding should be adjusted while opening')
        modal.toggle()
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        const currentPadding = Number.parseInt(window.getComputedStyle(fixedEl).paddingRight, 10)

        expect(fixedEl.hasAttribute('data-coreui-padding-right')).toEqual(false, 'data-coreui-padding-right should be cleared after closing')
        expect(currentPadding).toEqual(originalPadding, 'fixed element padding should be reset after closing')
        document.documentElement.style.overflowY = 'auto'
        done()
      })

      modal.toggle()
    })

    it('should adjust the inline margin of sticky elements when opening and restore when closing', done => {
      fixtureEl.innerHTML = [
        '<div class="sticky-top" style="margin-right: 0px;"></div>',
        '<div class="modal"><div class="modal-dialog"></div></div>'
      ].join('')

      document.documentElement.style.overflowY = 'scroll'

      const stickyTopEl = fixtureEl.querySelector('.sticky-top')
      const originalMargin = Number.parseInt(window.getComputedStyle(stickyTopEl).marginRight, 10)
      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)
      const scrollBarWidth = getScrollBarWidth()

      modalEl.addEventListener('shown.coreui.modal', () => {
        const expectedMargin = originalMargin - scrollBarWidth
        const currentMargin = Number.parseInt(window.getComputedStyle(stickyTopEl).marginRight, 10)

        expect(stickyTopEl.getAttribute('data-coreui-margin-right')).toEqual(`${originalMargin}px`, 'original sticky element margin should be stored in data-coreui-margin-right')
        expect(currentMargin).toEqual(expectedMargin, 'sticky element margin should be adjusted while opening')
        modal.toggle()
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        const currentMargin = Number.parseInt(window.getComputedStyle(stickyTopEl).marginRight, 10)

        expect(stickyTopEl.hasAttribute('data-coreui-margin-right')).toEqual(false, 'data-coreui-margin-right should be cleared after closing')
        expect(currentMargin).toEqual(originalMargin, 'sticky element margin should be reset after closing')

        document.documentElement.style.overflowY = 'auto'
        done()
      })

      modal.toggle()
    })

    it('should not adjust the inline margin and padding of sticky and fixed elements when element do not have full width', done => {
      fixtureEl.innerHTML = [
        '<div class="sticky-top" style="margin-right: 0px; padding-right: 0px; width: calc(100vw - 50%)"></div>',
        '<div class="modal"><div class="modal-dialog"></div></div>'
      ].join('')

      const stickyTopEl = fixtureEl.querySelector('.sticky-top')
      const originalMargin = Number.parseInt(window.getComputedStyle(stickyTopEl).marginRight, 10)
      const originalPadding = Number.parseInt(window.getComputedStyle(stickyTopEl).paddingRight, 10)
      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.coreui.modal', () => {
        const currentMargin = Number.parseInt(window.getComputedStyle(stickyTopEl).marginRight, 10)
        const currentPadding = Number.parseInt(window.getComputedStyle(stickyTopEl).paddingRight, 10)

        expect(currentMargin).toEqual(originalMargin, 'sticky element\'s margin should not be adjusted while opening')
        expect(currentPadding).toEqual(originalPadding, 'sticky element\'s padding should not be adjusted while opening')
        done()
      })

      modal.show()
    })

    it('should ignore values set via CSS when trying to restore body padding after closing', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'
      const styleTest = document.createElement('style')

      styleTest.type = 'text/css'
      styleTest.appendChild(document.createTextNode('body { padding-right: 7px; }'))
      document.head.appendChild(styleTest)

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.coreui.modal', () => {
        modal.toggle()
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        expect(window.getComputedStyle(document.body).paddingLeft).toEqual('0px', 'body does not have inline padding set')
        document.head.removeChild(styleTest)
        done()
      })

      modal.toggle()
    })

    it('should ignore other inline styles when trying to restore body padding after closing', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'
      const styleTest = document.createElement('style')

      styleTest.type = 'text/css'
      styleTest.appendChild(document.createTextNode('body { padding-right: 7px; }'))

      document.head.appendChild(styleTest)
      document.body.style.color = 'red'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.coreui.modal', () => {
        modal.toggle()
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        const bodyPaddingRight = document.body.style.paddingRight

        expect(bodyPaddingRight === '0px' || bodyPaddingRight === '').toEqual(true, 'body does not have inline padding set')
        expect(document.body.style.color).toEqual('red', 'body still has other inline styles set')
        document.head.removeChild(styleTest)
        document.body.removeAttribute('style')
        done()
      })

      modal.toggle()
    })
  })

  describe('show', () => {
    it('should show a modal', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('show.coreui.modal', e => {
        expect(e).toBeDefined()
      })

      modalEl.addEventListener('shown.coreui.modal', () => {
        expect(modalEl.getAttribute('aria-modal')).toEqual('true')
        expect(modalEl.getAttribute('role')).toEqual('dialog')
        expect(modalEl.getAttribute('aria-hidden')).toEqual(null)
        expect(modalEl.style.display).toEqual('block')
        expect(document.querySelector('.modal-backdrop')).toBeDefined()
        done()
      })

      modal.show()
    })

    it('should show a modal without backdrop', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl, {
        backdrop: false
      })

      modalEl.addEventListener('show.coreui.modal', e => {
        expect(e).toBeDefined()
      })

      modalEl.addEventListener('shown.coreui.modal', () => {
        expect(modalEl.getAttribute('aria-modal')).toEqual('true')
        expect(modalEl.getAttribute('role')).toEqual('dialog')
        expect(modalEl.getAttribute('aria-hidden')).toEqual(null)
        expect(modalEl.style.display).toEqual('block')
        expect(document.querySelector('.modal-backdrop')).toBeNull()
        done()
      })

      modal.show()
    })

    it('should show a modal and append the element', done => {
      const modalEl = document.createElement('div')
      const id = 'dynamicModal'

      modalEl.setAttribute('id', id)
      modalEl.classList.add('modal')
      modalEl.innerHTML = '<div class="modal-dialog"></div>'

      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.coreui.modal', () => {
        const dynamicModal = document.getElementById(id)
        expect(dynamicModal).toBeDefined()
        dynamicModal.parentNode.removeChild(dynamicModal)
        done()
      })

      modal.show()
    })

    it('should do nothing if a modal is shown', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      spyOn(EventHandler, 'trigger')
      modal._isShown = true

      modal.show()

      expect(EventHandler.trigger).not.toHaveBeenCalled()
    })

    it('should do nothing if a modal is transitioning', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      spyOn(EventHandler, 'trigger')
      modal._isTransitioning = true

      modal.show()

      expect(EventHandler.trigger).not.toHaveBeenCalled()
    })

    it('should not fire shown event when show is prevented', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('show.coreui.modal', e => {
        e.preventDefault()

        const expectedDone = () => {
          expect().nothing()
          done()
        }

        setTimeout(expectedDone, 10)
      })

      modalEl.addEventListener('shown.coreui.modal', () => {
        throw new Error('shown event triggered')
      })

      modal.show()
    })

    it('should set is transitioning if fade class is present', done => {
      fixtureEl.innerHTML = '<div class="modal fade"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('show.coreui.modal', () => {
        expect(modal._isTransitioning).toEqual(true)
      })

      modalEl.addEventListener('shown.coreui.modal', () => {
        expect(modal._isTransitioning).toEqual(false)
        done()
      })

      modal.show()
    })

    it('should close modal when a click occurred on data-coreui-dismiss="modal"', done => {
      fixtureEl.innerHTML = [
        '<div class="modal fade">',
        '  <div class="modal-dialog">',
        '    <div class="modal-header">',
        '      <button type="button" data-coreui-dismiss="modal"></button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const btnClose = fixtureEl.querySelector('[data-coreui-dismiss="modal"]')
      const modal = new Modal(modalEl)

      spyOn(modal, 'hide').and.callThrough()

      modalEl.addEventListener('shown.coreui.modal', () => {
        btnClose.click()
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        expect(modal.hide).toHaveBeenCalled()
        done()
      })

      modal.show()
    })

    it('should set .modal\'s scroll top to 0', done => {
      fixtureEl.innerHTML = [
        '<div class="modal fade">',
        '  <div class="modal-dialog">',
        '  </div>',
        '</div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.coreui.modal', () => {
        expect(modalEl.scrollTop).toEqual(0)
        done()
      })

      modal.show()
    })

    it('should set modal body scroll top to 0 if modal body do not exists', done => {
      fixtureEl.innerHTML = [
        '<div class="modal fade">',
        '  <div class="modal-dialog">',
        '    <div class="modal-body"></div>',
        '  </div>',
        '</div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const modalBody = modalEl.querySelector('.modal-body')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.coreui.modal', () => {
        expect(modalBody.scrollTop).toEqual(0)
        done()
      })

      modal.show()
    })

    it('should not enforce focus if focus equal to false', done => {
      fixtureEl.innerHTML = '<div class="modal fade"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl, {
        focus: false
      })

      spyOn(modal, '_enforceFocus')

      modalEl.addEventListener('shown.coreui.modal', () => {
        expect(modal._enforceFocus).not.toHaveBeenCalled()
        done()
      })

      modal.show()
    })

    it('should add listener when escape touch is pressed', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      spyOn(modal, 'hide').and.callThrough()

      modalEl.addEventListener('shown.coreui.modal', () => {
        const keydownEscape = createEvent('keydown')
        keydownEscape.key = 'Escape'

        modalEl.dispatchEvent(keydownEscape)
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        expect(modal.hide).toHaveBeenCalled()
        done()
      })

      modal.show()
    })

    it('should do nothing when the pressed key is not escape', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      spyOn(modal, 'hide')

      const expectDone = () => {
        expect(modal.hide).not.toHaveBeenCalled()

        done()
      }

      modalEl.addEventListener('shown.coreui.modal', () => {
        const keydownTab = createEvent('keydown')
        keydownTab.key = 'Tab'

        modalEl.dispatchEvent(keydownTab)
        setTimeout(expectDone, 30)
      })

      modal.show()
    })

    it('should adjust dialog on resize', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      spyOn(modal, '_adjustDialog').and.callThrough()

      const expectDone = () => {
        expect(modal._adjustDialog).toHaveBeenCalled()

        done()
      }

      modalEl.addEventListener('shown.coreui.modal', () => {
        const resizeEvent = createEvent('resize')

        window.dispatchEvent(resizeEvent)
        setTimeout(expectDone, 10)
      })

      modal.show()
    })

    it('should not close modal when clicking outside of modal-content if backdrop = false', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl, {
        backdrop: false
      })

      const shownCallback = () => {
        setTimeout(() => {
          expect(modal._isShown).toEqual(true)
          done()
        }, 10)
      }

      modalEl.addEventListener('shown.coreui.modal', () => {
        modalEl.click()
        shownCallback()
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        throw new Error('Should not hide a modal')
      })

      modal.show()
    })

    it('should not close modal when clicking outside of modal-content if backdrop = static', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl, {
        backdrop: 'static'
      })

      const shownCallback = () => {
        setTimeout(() => {
          expect(modal._isShown).toEqual(true)
          done()
        }, 10)
      }

      modalEl.addEventListener('shown.coreui.modal', () => {
        modalEl.click()
        shownCallback()
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        throw new Error('Should not hide a modal')
      })

      modal.show()
    })

    it('should close modal when escape key is pressed with keyboard = true and backdrop is static', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl, {
        backdrop: 'static',
        keyboard: true
      })

      const shownCallback = () => {
        setTimeout(() => {
          expect(modal._isShown).toEqual(false)
          done()
        }, 10)
      }

      modalEl.addEventListener('shown.coreui.modal', () => {
        const keydownEscape = createEvent('keydown')
        keydownEscape.key = 'Escape'

        modalEl.dispatchEvent(keydownEscape)
        shownCallback()
      })

      modal.show()
    })

    it('should not close modal when escape key is pressed with keyboard = false', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl, {
        keyboard: false
      })

      const shownCallback = () => {
        setTimeout(() => {
          expect(modal._isShown).toEqual(true)
          done()
        }, 10)
      }

      modalEl.addEventListener('shown.coreui.modal', () => {
        const keydownEscape = createEvent('keydown')
        keydownEscape.key = 'Escape'

        modalEl.dispatchEvent(keydownEscape)
        shownCallback()
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        throw new Error('Should not hide a modal')
      })

      modal.show()
    })

    it('should not overflow when clicking outside of modal-content if backdrop = static', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog" style="transition-duration: 20ms;"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl, {
        backdrop: 'static'
      })

      modalEl.addEventListener('shown.coreui.modal', () => {
        modalEl.click()
        setTimeout(() => {
          expect(modalEl.clientHeight).toEqual(modalEl.scrollHeight)
          done()
        }, 20)
      })

      modal.show()
    })

    it('should not adjust the inline body padding when it does not overflow', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)
      const originalPadding = window.getComputedStyle(document.body).paddingRight

      // Hide scrollbars to prevent the body overflowing
      document.body.style.overflow = 'hidden'
      document.documentElement.style.paddingRight = '0px'

      modalEl.addEventListener('shown.coreui.modal', () => {
        const currentPadding = window.getComputedStyle(document.body).paddingRight

        expect(currentPadding).toEqual(originalPadding, 'body padding should not be adjusted')

        // Restore scrollbars
        document.body.style.overflow = 'auto'
        done()
      })

      modal.show()
    })

    it('should not adjust the inline body padding when it does not overflow, even on a scaled display', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)
      const originalPadding = window.getComputedStyle(document.body).paddingRight

      // Remove body margins as would be done by Bootstrap css
      document.body.style.margin = '0'

      // Hide scrollbars to prevent the body overflowing
      document.body.style.overflow = 'hidden'

      // Simulate a discrepancy between exact, i.e. floating point body width, and rounded body width
      // as it can occur when zooming or scaling the display to something else than 100%
      document.documentElement.style.paddingRight = '.48px'

      modalEl.addEventListener('shown.coreui.modal', () => {
        const currentPadding = window.getComputedStyle(document.body).paddingRight

        expect(currentPadding).toEqual(originalPadding, 'body padding should not be adjusted')

        // Restore overridden css
        document.body.style.removeProperty('margin')
        document.body.style.removeProperty('overflow')
        done()
      })

      modal.show()
    })

    it('should enforce focus', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      spyOn(modal, '_enforceFocus').and.callThrough()

      const focusInListener = () => {
        expect(modal._element.focus).toHaveBeenCalled()
        document.removeEventListener('focusin', focusInListener)
        done()
      }

      modalEl.addEventListener('shown.coreui.modal', () => {
        expect(modal._enforceFocus).toHaveBeenCalled()

        spyOn(modal._element, 'focus')

        document.addEventListener('focusin', focusInListener)

        const focusInEvent = createEvent('focusin', { bubbles: true })
        Object.defineProperty(focusInEvent, 'target', {
          value: fixtureEl
        })

        document.dispatchEvent(focusInEvent)
      })

      modal.show()
    })
  })

  describe('hide', () => {
    it('should hide a modal', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.coreui.modal', () => {
        modal.hide()
      })

      modalEl.addEventListener('hide.coreui.modal', e => {
        expect(e).toBeDefined()
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        expect(modalEl.getAttribute('aria-modal')).toEqual(null)
        expect(modalEl.getAttribute('role')).toEqual(null)
        expect(modalEl.getAttribute('aria-hidden')).toEqual('true')
        expect(modalEl.style.display).toEqual('none')
        expect(document.querySelector('.modal-backdrop')).toBeNull()
        done()
      })

      modal.show()
    })

    it('should close modal when clicking outside of modal-content', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.coreui.modal', () => {
        modalEl.click()
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        expect(modalEl.getAttribute('aria-modal')).toEqual(null)
        expect(modalEl.getAttribute('role')).toEqual(null)
        expect(modalEl.getAttribute('aria-hidden')).toEqual('true')
        expect(modalEl.style.display).toEqual('none')
        expect(document.querySelector('.modal-backdrop')).toBeNull()
        done()
      })

      modal.show()
    })

    it('should do nothing is the modal is not shown', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modal.hide()

      expect().nothing()
    })

    it('should do nothing is the modal is transitioning', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modal._isTransitioning = true
      modal.hide()

      expect().nothing()
    })

    it('should not hide a modal if hide is prevented', done => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      modalEl.addEventListener('shown.coreui.modal', () => {
        modal.hide()
      })

      const hideCallback = () => {
        setTimeout(() => {
          expect(modal._isShown).toEqual(true)
          done()
        }, 10)
      }

      modalEl.addEventListener('hide.coreui.modal', e => {
        e.preventDefault()
        hideCallback()
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        throw new Error('should not trigger hidden')
      })

      modal.show()
    })
  })

  describe('dispose', () => {
    it('should dispose a modal', () => {
      fixtureEl.innerHTML = '<div id="exampleModal" class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      expect(Modal.getInstance(modalEl)).toEqual(modal)

      spyOn(EventHandler, 'off')

      modal.dispose()

      expect(Modal.getInstance(modalEl)).toEqual(null)
      expect(EventHandler.off).toHaveBeenCalledTimes(4)
    })
  })

  describe('handleUpdate', () => {
    it('should call adjust dialog', () => {
      fixtureEl.innerHTML = '<div id="exampleModal" class="modal"><div class="modal-dialog"></div></div>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      spyOn(modal, '_adjustDialog')

      modal.handleUpdate()

      expect(modal._adjustDialog).toHaveBeenCalled()
    })
  })

  describe('data-api', () => {
    it('should toggle modal', done => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-toggle="modal" data-coreui-target="#exampleModal"></button>',
        '<div id="exampleModal" class="modal"><div class="modal-dialog"></div></div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const trigger = fixtureEl.querySelector('[data-coreui-toggle="modal"]')

      modalEl.addEventListener('shown.coreui.modal', () => {
        expect(modalEl.getAttribute('aria-modal')).toEqual('true')
        expect(modalEl.getAttribute('role')).toEqual('dialog')
        expect(modalEl.getAttribute('aria-hidden')).toEqual(null)
        expect(modalEl.style.display).toEqual('block')
        expect(document.querySelector('.modal-backdrop')).toBeDefined()
        setTimeout(() => trigger.click(), 10)
      })

      modalEl.addEventListener('hidden.coreui.modal', () => {
        expect(modalEl.getAttribute('aria-modal')).toEqual(null)
        expect(modalEl.getAttribute('role')).toEqual(null)
        expect(modalEl.getAttribute('aria-hidden')).toEqual('true')
        expect(modalEl.style.display).toEqual('none')
        expect(document.querySelector('.modal-backdrop')).toEqual(null)
        done()
      })

      trigger.click()
    })

    it('should not recreate a new modal', done => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-toggle="modal" data-coreui-target="#exampleModal"></button>',
        '<div id="exampleModal" class="modal"><div class="modal-dialog"></div></div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)
      const trigger = fixtureEl.querySelector('[data-coreui-toggle="modal"]')

      spyOn(modal, 'show').and.callThrough()

      modalEl.addEventListener('shown.coreui.modal', () => {
        expect(modal.show).toHaveBeenCalled()
        done()
      })

      trigger.click()
    })

    it('should prevent default when the trigger is <a> or <area>', done => {
      fixtureEl.innerHTML = [
        '<a data-coreui-toggle="modal" href="#" data-coreui-target="#exampleModal"></a>',
        '<div id="exampleModal" class="modal"><div class="modal-dialog"></div></div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const trigger = fixtureEl.querySelector('[data-coreui-toggle="modal"]')

      spyOn(Event.prototype, 'preventDefault').and.callThrough()

      modalEl.addEventListener('shown.coreui.modal', () => {
        expect(modalEl.getAttribute('aria-modal')).toEqual('true')
        expect(modalEl.getAttribute('role')).toEqual('dialog')
        expect(modalEl.getAttribute('aria-hidden')).toEqual(null)
        expect(modalEl.style.display).toEqual('block')
        expect(document.querySelector('.modal-backdrop')).toBeDefined()
        expect(Event.prototype.preventDefault).toHaveBeenCalled()
        done()
      })

      trigger.click()
    })

    it('should focus the trigger on hide', done => {
      fixtureEl.innerHTML = [
        '<a data-coreui-toggle="modal" href="#" data-coreui-target="#exampleModal"></a>',
        '<div id="exampleModal" class="modal"><div class="modal-dialog"></div></div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const trigger = fixtureEl.querySelector('[data-coreui-toggle="modal"]')

      spyOn(trigger, 'focus')

      modalEl.addEventListener('shown.coreui.modal', () => {
        const modal = Modal.getInstance(modalEl)

        modal.hide()
      })

      const hideListener = () => {
        setTimeout(() => {
          expect(trigger.focus).toHaveBeenCalled()
          done()
        }, 20)
      }

      modalEl.addEventListener('hidden.coreui.modal', () => {
        hideListener()
      })

      trigger.click()
    })

    it('should not focus the trigger if the modal is not visible', done => {
      fixtureEl.innerHTML = [
        '<a data-coreui-toggle="modal" href="#" data-coreui-target="#exampleModal" style="display: none;"></a>',
        '<div id="exampleModal" class="modal" style="display: none;"><div class="modal-dialog"></div></div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const trigger = fixtureEl.querySelector('[data-coreui-toggle="modal"]')

      spyOn(trigger, 'focus')

      modalEl.addEventListener('shown.coreui.modal', () => {
        const modal = Modal.getInstance(modalEl)

        modal.hide()
      })

      const hideListener = () => {
        setTimeout(() => {
          expect(trigger.focus).not.toHaveBeenCalled()
          done()
        }, 20)
      }

      modalEl.addEventListener('hidden.coreui.modal', () => {
        hideListener()
      })

      trigger.click()
    })

    it('should not focus the trigger if the modal is not shown', done => {
      fixtureEl.innerHTML = [
        '<a data-coreui-toggle="modal" href="#" data-coreui-target="#exampleModal"></a>',
        '<div id="exampleModal" class="modal"><div class="modal-dialog"></div></div>'
      ].join('')

      const modalEl = fixtureEl.querySelector('.modal')
      const trigger = fixtureEl.querySelector('[data-coreui-toggle="modal"]')

      spyOn(trigger, 'focus')

      const showListener = () => {
        setTimeout(() => {
          expect(trigger.focus).not.toHaveBeenCalled()
          done()
        }, 10)
      }

      modalEl.addEventListener('show.coreui.modal', e => {
        e.preventDefault()
        showListener()
      })

      trigger.click()
    })
  })

  describe('jQueryInterface', () => {
    it('should create a modal', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.modal = Modal.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.modal.call(jQueryMock)

      expect(Modal.getInstance(div)).toBeDefined()
    })

    it('should create a modal with given config', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.modal = Modal.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.modal.call(jQueryMock, { keyboard: false })
      spyOn(Modal.prototype, 'constructor')
      expect(Modal.prototype.constructor).not.toHaveBeenCalledWith(div, { keyboard: false })

      const modal = Modal.getInstance(div)
      expect(modal).toBeDefined()
      expect(modal._config.keyboard).toBe(false)
    })

    it('should not re create a modal', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const div = fixtureEl.querySelector('div')
      const modal = new Modal(div)

      jQueryMock.fn.modal = Modal.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.modal.call(jQueryMock)

      expect(Modal.getInstance(div)).toEqual(modal)
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const div = fixtureEl.querySelector('div')
      const action = 'undefinedMethod'

      jQueryMock.fn.modal = Modal.jQueryInterface
      jQueryMock.elements = [div]

      expect(() => {
        jQueryMock.fn.modal.call(jQueryMock, action)
      }).toThrowError(TypeError, `No method named "${action}"`)
    })

    it('should call show method', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const div = fixtureEl.querySelector('div')
      const modal = new Modal(div)

      jQueryMock.fn.modal = Modal.jQueryInterface
      jQueryMock.elements = [div]

      spyOn(modal, 'show')

      jQueryMock.fn.modal.call(jQueryMock, 'show')

      expect(modal.show).toHaveBeenCalled()
    })

    it('should not call show method', () => {
      fixtureEl.innerHTML = '<div class="modal" data-coreui-show="false"><div class="modal-dialog"></div></div>'

      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.modal = Modal.jQueryInterface
      jQueryMock.elements = [div]

      spyOn(Modal.prototype, 'show')

      jQueryMock.fn.modal.call(jQueryMock)

      expect(Modal.prototype.show).not.toHaveBeenCalled()
    })
  })

  describe('getInstance', () => {
    it('should return modal instance', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const div = fixtureEl.querySelector('div')
      const modal = new Modal(div)

      expect(Modal.getInstance(div)).toEqual(modal)
      expect(Modal.getInstance(div)).toBeInstanceOf(Modal)
    })

    it('should return null when there is no modal instance', () => {
      fixtureEl.innerHTML = '<div class="modal"><div class="modal-dialog"></div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Modal.getInstance(div)).toEqual(null)
    })
  })
})
