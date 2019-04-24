import toast from 'toastr'
import { State } from './State'

(() => {
    const actionButton = document.querySelector('.Button--action')
    const state = new State({})

    if (actionButton) {
        disableActionButton()

        const emailInput = document.querySelector('[name="email"]')
        const passwordInput = document.querySelector('[name="password"]')
        const repeatPasswordInput = document.querySelector('[name="repeat-password"]')
        const nicknameInput = document.querySelector('[name="name"]')

        if (emailInput && passwordInput && repeatPasswordInput && nicknameInput) {
            emailInput.addEventListener('keyup', onInput('email'))
            passwordInput.addEventListener('keyup', onInput('password'))
            repeatPasswordInput.addEventListener('keyup', onInput('repeat-password'))
            nicknameInput.addEventListener('keyup', onInput('name'))
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
            const repeatPassword = state.get('repeat-password')
            const nickname = state.get('name')

            if (!email
                || email.length === 0
                || !password
                || password.length === 0
                || !repeatPassword
                || repeatPassword.length === 0
                || !nickname
                || nickname.length === 0
                || password !== repeatPassword
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
