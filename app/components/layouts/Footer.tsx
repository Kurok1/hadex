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

export default function Footer () {
    return <footer className="h-[calc(4rem)] footer footer-center sm:footer-horizontal items-center p-4">
  <aside className="grid-flow-col items-center">
    <p className="text-base-content">Copyright © {new Date().getFullYear()} <em>Kurok1</em>. Licensed under <a className="link link-hover" href="https://www.google.com/search?q=%E9%93%BE%E6%8E%A5"> Apache-2.0 </a></p>
  </aside>
</footer>
}