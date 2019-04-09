export interface PollType {
    run: () => void
    stop: () => void
    on: (eventName: string, listener: Function) => void
}
