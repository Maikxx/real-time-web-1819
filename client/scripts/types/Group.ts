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
