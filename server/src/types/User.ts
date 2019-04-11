export interface User {
    _id: number
    email: string
    username: string
    password: string
    joined_groups: any[] | null
    created_at: string
}
