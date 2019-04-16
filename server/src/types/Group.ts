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

export interface GroupParticipant {
    _id: number
    user_id: number
    group_id: number
    bet: string | null
    effort: number
    hypothetical_gain: number
    score: number
    created_at: Date
}
