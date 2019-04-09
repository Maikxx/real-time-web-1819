interface StateProps {}

export class State {
    constructor(public props: StateProps) {}

    public set(key: string, value: any) {
        this[key] = value
    }

    public get(key: string) {
        return this[key]
    }
}
