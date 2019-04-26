import EventEmitter from 'events'

EventEmitter.prototype.setMaxListeners(500)

export const groupCreationEmitter = new EventEmitter()
export const groupParticipantCreationEmitter = new EventEmitter()
export const groupScoreChanged = new EventEmitter()
