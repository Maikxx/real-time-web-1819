export interface Participant {
    group_id: number
    user_id: number
    username: string
}

export interface Group {
    _id: number
    name: string
    crypto_currency: string
    participants: Participant[]
}

export interface GroupQueryResult {
    error: string | null
    group: Group
}

export interface ChangeBetData {
    error: string | null
    success: boolean
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

export type BetType = 'HIGH' | 'LOW'
