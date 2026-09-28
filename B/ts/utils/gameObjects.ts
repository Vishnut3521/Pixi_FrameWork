export class GameObjects {

    public readonly OBJECTS: Record<string, any> = {};

    public register(name: string, object: any): void {
        if (this.OBJECTS[name]) {
            throw new Error(`Object "${name}" already exists.`);
        }

        this.OBJECTS[name] = object;
    }

    public get(name: string): any {
        return this.OBJECTS[name];
    }

    public remove(name: string): void {
        delete this.OBJECTS[name];
    }
}
