export class FileMetadata {
  private _md5: string;
  private _lineCount: number;

  constructor(md5: string, lineCount: number) {
    this._md5 = md5;
    this._lineCount = lineCount;
  }

  get md5(): string {
    return this._md5;
  }

  get lineCount(): number {
    return this._lineCount;
  }
}