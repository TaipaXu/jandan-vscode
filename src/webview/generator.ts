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
    type CommentListItem,
    type CommentListResponse,
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

const getWebviewHtml = (context: vscode.ExtensionContext, content: string): string => {
    const resourcePath = path.join(context.extensionPath, 'static/web/index.html');
    return fs.readFileSync(resourcePath, 'utf-8').replace('${content}', content);
};

const getCommentWebviewHtml = (context: vscode.ExtensionContext, content: string): string => {
    const resourcePath = path.join(context.extensionPath, 'static/web/comment.html');
    return fs.readFileSync(resourcePath, 'utf-8').replace('${content}', content);
};

const escapeHtml = (value: string | number | boolean | null | undefined): string => {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const getCommentListItems = (items: CommentListItem[] | undefined): CommentListItem[] => {
    return Array.isArray(items) ? items : [];
};

const renderCommentItem = (item: CommentListItem): string => {
    const positive = item.vote_positive ?? 0;
    const negative = item.vote_negative ?? 0;
    const location = item.ip_location ? `<span>IP: ${escapeHtml(item.ip_location)}</span>` : '';
    const date = item.comment_date ? `<span>${escapeHtml(item.comment_date)}</span>` : '';

    return `
        <article class="comment-item">
            <div class="comment-item__meta">
                <strong class="comment-item__author">${escapeHtml(item.comment_author)}</strong>
                ${date}
                ${location}
            </div>
            <div class="comment-item__content">${item.comment_content || ''}</div>
            <div class="comment-item__stats">${positive} oo / ${negative} xx</div>
        </article>
    `;
};

const renderCommentSection = (title: string, items: CommentListItem[]): string => {
    if (items.length === 0) {
        return '';
    }

    return `
        <section class="comment-section">
            <h2 class="comment-section__title">${escapeHtml(title)}</h2>
            <div class="comment-list">
                ${items.map(renderCommentItem).join('')}
            </div>
        </section>
    `;
};

const renderCommentListContent = (response: CommentListResponse): string => {
    const hotComments = getCommentListItems(response.hotComments);
    const comments = getCommentListItems(response.comments);

    if (hotComments.length === 0 && comments.length === 0) {
        return '<p class="comment-message">暂无评论</p>';
    }

    return `
        ${renderCommentSection('热门评论', hotComments)}
        ${renderCommentSection('全部评论', comments)}
        ${response.hasNextPage ? '<p class="comment-message">还有更多评论</p>' : ''}
    `;
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
    let html: string;
    if (type === 'news' && isNewsPost(data)) {
        html = getWebviewHtml(context, data.content);
        html = html.replace(/src="\/\//g, 'src="https://');
    } else {
        html = getWebviewHtml(context, getCommentContent(data));
    }

    return html;
}

export function generateCommentHtml(
    context: vscode.ExtensionContext,
    response?: CommentListResponse,
    error?: string,
): string {
    const body = error
        ? `<p class="comment-message">${escapeHtml(error)}</p>`
        : response
          ? renderCommentListContent(response)
          : '<p class="comment-message">加载评论中...</p>';

    const html = getCommentWebviewHtml(context, body);

    return html.replace(/src="\/\//g, 'src="https://');
}
