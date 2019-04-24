import toast from 'toastr'
import { State } from './State'

(() => {
    const actionButton = document.querySelector('.Button--action')
    const state = new State({})

    if (actionButton) {
        disableActionButton()

        const emailInput = document.querySelector('[name="email"]')
        const passwordInput = document.querySelector('[name="password"]')

        if (emailInput && passwordInput) {
            emailInput.addEventListener('keyup', onInput('email'))
            passwordInput.addEventListener('keyup', onInput('password'))
        } else {
            toast.error('Not all required input fields could be found to validate input.')
        }

        function onInput(inputName: string) {
            return function({ target }: KeyboardEvent) {
                const { value } = target as HTMLInputElement
                state.set(inputName, value)
                validate()
            }
        }

        function validate() {
            const email = state.get('email')
            const password = state.get('password')

            if (!email
                || email.length === 0
                || !password
                || password.length === 0
            ) {
                return disableActionButton()
            }

            enableActionButton()
        }

        function disableActionButton() {
            if (actionButton) {
                actionButton.setAttribute('disabled', 'disabled')
                actionButton.classList.add('Button--disabled')
            }
        }

        function enableActionButton() {
            if (actionButton) {
                actionButton.removeAttribute('disabled')
                actionButton.classList.remove('Button--disabled')
            }
        }
    }
})()
