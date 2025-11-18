declare module 'threebox-plugin' {
  export class Threebox {
    constructor(map: any, gl: any, options?: any);
    loadObj(options: any, callback: (model: any) => void): void;
    add(object: any): void;
    update(): void;
    cube(options: any): any;
    sphere(options: any): any;
  }
} 