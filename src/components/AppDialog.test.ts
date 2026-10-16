// @vitest-environment happy-dom
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import AppDialog from './AppDialog.vue'

enableAutoUnmount(afterEach)

const props = { title: 'Start a new Hard game?', message: 'Your current Easy game will be lost.', confirmLabel: 'New game', cancelLabel: 'Cancel' }

const button = (dialog: ReturnType<typeof mount>, label: string) => dialog.findAll('button').find((b) => b.text() === label)!

describe('AppDialog', () => {
  it('closes as confirmed from its confirm button', async () => {
    const dialog = mount(AppDialog, { props, attachTo: document.body })
    await button(dialog, 'New game').trigger('click')
    expect(dialog.emitted('close')).toEqual([[true]])
  })

  it('closes as cancelled from Cancel, Escape or the backdrop, starting with focus on Cancel', async () => {
    const dialog = mount(AppDialog, { props, attachTo: document.body })
    expect(document.activeElement).toBe(button(dialog, 'Cancel').element)

    await button(dialog, 'Cancel').trigger('click')
    await dialog.find('dialog').trigger('cancel')
    await dialog.find('dialog').trigger('click')
    expect(dialog.emitted('close')).toEqual([[false], [false], [false]])
  })

  it('shows a lone OK button when there is nothing to cancel', async () => {
    const dialog = mount(AppDialog, { props: { title: 'Couldn’t load a Hard puzzle', message: 'Check your connection and try again.', confirmLabel: 'OK' }, attachTo: document.body })
    expect(dialog.findAll('button').map((b) => b.text())).toEqual(['OK'])
    expect(document.activeElement).toBe(button(dialog, 'OK').element)
  })
})
