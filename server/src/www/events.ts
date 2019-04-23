import EventEmitter from 'events'

export const groupCreationEmitter = new EventEmitter()
export const groupParticipantCreationEmitter = new EventEmitter()
export const groupScoreChanged = new EventEmitter()

groupCreationEmitter.setMaxListeners(1000)
groupParticipantCreationEmitter.setMaxListeners(1000)
groupScoreChanged.setMaxListeners(1000)
