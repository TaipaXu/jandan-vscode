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

import path from 'path';
import fs from 'fs';
import * as vscode from 'vscode';
import { type NewsPost } from '../api/news';
import {
    type CommentTreeItem,
    type CommentWebviewType,
    type JandanWebviewType,
} from '../api/types';

type WebviewData = NewsPost | CommentTreeItem;

const isNewsPost = (data: WebviewData): data is NewsPost => {
    return 'contentLoaded' in data;
};

const getCommentContent = (data: WebviewData): string => {
    if (!('comment_content' in data)) {
        return '';
    }

    return data.comment_content || data.content || '';
};

export function generateHtml(
    context: vscode.ExtensionContext,
    type: 'news',
    data: NewsPost,
): string;
export function generateHtml(
    context: vscode.ExtensionContext,
    type: CommentWebviewType,
    data: CommentTreeItem,
): string;
export function generateHtml(
    context: vscode.ExtensionContext,
    type: JandanWebviewType,
    data: WebviewData,
): string {
    const resourcePath = path.join(context.extensionPath, 'static/web/index.html');
    let html = fs.readFileSync(resourcePath, 'utf-8');

    if (type === 'news' && isNewsPost(data)) {
        html = html.replace('${content}', data.content);
        html = html.replace(/src="\/\//g, 'src="https://');
    } else {
        html = html.replace('${content}', getCommentContent(data));
    }

    return html;
}
