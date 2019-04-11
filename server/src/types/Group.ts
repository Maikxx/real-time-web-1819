export interface Group {
    _id: number
    name: string
    currency: number
    group_participants: any[] | null
    created_at: Date
}

export interface CreateGroupArgs {
    name: string
    currency: string
}
