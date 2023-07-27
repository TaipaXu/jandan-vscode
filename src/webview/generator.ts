/*
 * GNU General Public License, Version 3.0
 *
 * Copyright (c) 2019 Taipa Xu
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import path from "path";
import fs from 'fs';
import * as vscode from 'vscode';

export function generateHtml(context: vscode.ExtensionContext, type: string, data: any): string {
    const resourcePath = path.join(context.extensionPath, 'static/web/index.html');
    let html = fs.readFileSync(resourcePath, 'utf-8');

    if (type === 'news') {
        html = html.replace('${content}', data.content);
        html = html.replace('src="//', 'src="https://');
    } else if (type === 'talk') {
        html = html.replace('${content}', data.comment_content);
    } else {
        let picsDom = '';
        data.pics.forEach((url: string) => {
            const cdnUrl: string = `https://cdn.cdnjson.com/${url.replace(/^https?:\/\//, '')}`;
            picsDom += `
                <div class="pic__img">
                    <img src="${cdnUrl}" alt="">
                </div>
            `;
        });

        html = html.replace('${content}', picsDom);
    }
    return html;
}
