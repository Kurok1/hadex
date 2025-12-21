/**
 * Copyright 2025 Kurok1
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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