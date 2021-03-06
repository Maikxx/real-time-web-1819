export interface User {
    _id: number
    email: string
    username: string
    password: string
    created_at: string
}

export interface UserSignUpArgs {
    email: string
    password: string
    name: string
    'repeat-password': string
}
