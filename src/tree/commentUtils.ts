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

import { type CommentPostItem, type CommentTreeItem } from '../api/types';

const imageSrcRegexp = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;

export const getImageUrls = (content: string): string[] => {
    const urls: string[] = [];
    let match: RegExpExecArray | null;

    imageSrcRegexp.lastIndex = 0;
    while ((match = imageSrcRegexp.exec(content)) !== null) {
        urls.push(match[1]);
    }

    return urls;
};

const getContent = (element: CommentPostItem): string => {
    return typeof element.content === 'string' ? element.content : '';
};

const getPics = (element: CommentPostItem, content: string): string[] => {
    return Array.isArray(element.images) ? element.images : getImageUrls(content);
};

export const normalizeCommentItem = (element: CommentPostItem): CommentTreeItem => {
    const content = getContent(element);

    return {
        ...element,
        comment_ID: String(element.id),
        comment_author: element.author,
        comment_content: content,
        pics: getPics(element, content),
    };
};
