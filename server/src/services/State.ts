interface StateProps {}

export class State {
    constructor(private props: StateProps) {}

    public set(key: string, value: any) {
        this[key] = value
    }

    public get(key: string) {
        return this[key]
    }
}
