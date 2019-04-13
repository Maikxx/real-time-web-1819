export interface Group {
    _id: number
    name: string
    currency: number
    created_at: Date
}

export interface CreateGroupArgs {
    name: string
    currency: string
}
