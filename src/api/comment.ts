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
import { type CommentListItem, type CommentListResponse } from './types';

interface CommentListApiResponse {
    code?: number;
    msg?: string;
    has_next_page?: boolean;
    [key: string]: unknown;
}

const getCommentApiItems = (data: CommentListApiResponse, key: string): CommentListItem[] => {
    const items = data[key];
    return Array.isArray(items) ? (items as CommentListItem[]) : [];
};

const normalizeCommentList = (data: CommentListApiResponse): CommentListResponse => {
    return {
        ...data,
        hotComments: getCommentApiItems(data, 'hot_tucao'),
        comments: getCommentApiItems(data, 'tucao'),
        hasNextPage: Boolean(data.has_next_page),
    };
};

export const getComments = async (
    commentId: number | string,
    signal?: AbortSignal,
): Promise<RequestResponse<CommentListResponse>> => {
    const response = await request<CommentListApiResponse>({
        url: `/api/tucao/list/${commentId}`,
        method: 'GET',
        signal,
        headers: {
            Referer: 'https://jandan.net/',
        },
    });
    return {
        ...response,
        data: normalizeCommentList(response.data),
    };
};
