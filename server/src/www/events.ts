import EventEmitter from 'events'

export const groupCreationEmitter = new EventEmitter()
export const groupParticipantCreationEmitter = new EventEmitter()
export const groupScoreChanged = new EventEmitter()
