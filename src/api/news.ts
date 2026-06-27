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

import request, { type RequestResponse } from '../request';

export interface NewsPost {
    id: number;
    url: string;
    title: string;
    excerpt: string;
    content: string;
    contentLoaded: boolean;
    comment_count: number;
    thumbnail?: string;
}

const decodeHtml = (value: string): string => {
    return value
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};

const stripHtml = (value: string): string => {
    return decodeHtml(
        value
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim(),
    );
};

const toAbsoluteUrl = (url: string): string => {
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    if (url.startsWith('//')) {
        return `https:${url}`;
    }

    return `https://jandan.net${url.startsWith('/') ? url : `/${url}`}`;
};

const getPostId = (url: string): number => {
    const match = url.match(/\/p\/(\d+)\/?/);
    return match ? Number(match[1]) : 0;
};

const getNewsFallbackContent = (title: string, excerpt: string, url: string): string => {
    return `
        <h1>${title}</h1>
        <p>${excerpt}</p>
        <p><a href="${url}">${url}</a></p>
    `;
};

export const parseNewsList = (html: string): NewsPost[] => {
    const posts: NewsPost[] = [];
    const itemMarker = '<div class="post-item row">';
    let start = html.indexOf(itemMarker);

    while (start !== -1) {
        const nextItem = html.indexOf(itemMarker, start + itemMarker.length);
        const nextDateRow = html.indexOf('<div class="row date-row">', start + itemMarker.length);
        const mainEnd = html.indexOf('</main>', start + itemMarker.length);
        const end = [nextItem, nextDateRow, mainEnd]
            .filter((index) => index > start)
            .sort((a, b) => a - b)[0];
        const fragment = html.slice(start, end === undefined ? html.length : end);
        const titleMatch = fragment.match(
            /<h2 class="post-title">\s*<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h2>/,
        );

        if (titleMatch) {
            const url = toAbsoluteUrl(titleMatch[1]);
            const title = stripHtml(titleMatch[2]);
            const excerptMatch = fragment.match(/<div class="post-excerpt">([\s\S]*?)<\/div>/);
            const commentCountMatch = fragment.match(
                /<div class="post-comment-count[^"]*">([\s\S]*?)<\/div>/,
            );
            const thumbnailMatch = fragment.match(
                /<div class="post-thumb[\s\S]*?<img[^>]+src="([^"]+)"/,
            );
            const excerpt = excerptMatch ? stripHtml(excerptMatch[1]) : '';

            posts.push({
                id: getPostId(url),
                url,
                title,
                excerpt,
                content: getNewsFallbackContent(title, excerpt, url),
                contentLoaded: false,
                comment_count: commentCountMatch ? Number(stripHtml(commentCountMatch[1])) : 0,
                thumbnail: thumbnailMatch ? toAbsoluteUrl(thumbnailMatch[1]) : undefined,
            });
        }

        start = nextItem;
    }

    return posts;
};

export const parseNewsContent = (html: string): string => {
    const contentMatch = html.match(/<div class="post-content">\s*([\s\S]*?)\s*<\/div>\s*<script>/);
    return contentMatch ? contentMatch[1].replace(/src="\/\//g, 'src="https://') : '';
};

export const getNews = async (
    page: number = 1,
    signal?: AbortSignal,
): Promise<RequestResponse<{ posts: NewsPost[] }>> => {
    const url = page <= 1 ? '/' : `/page/${page}`;

    const response = await request<string>({
        url,
        method: 'GET',
        signal,
        responseType: 'text',
    });

    return {
        ...response,
        data: {
            posts: parseNewsList(response.data),
        },
    };
};

export const getNewsContent = async (
    url: string,
    signal?: AbortSignal,
): Promise<RequestResponse<string>> => {
    const response = await request<string>({
        url,
        method: 'GET',
        signal,
        responseType: 'text',
    });

    return {
        ...response,
        data: parseNewsContent(response.data),
    };
};
