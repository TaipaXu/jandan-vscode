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

export type LikeType = 'pos' | 'neg';

export type CommentPostViewType = 'pic' | 'ooxx' | 'nvzhuang' | 'treehole' | 'qa';

export type CommentWebviewType = CommentPostViewType | 'top' | 'talk';

export type JandanViewType = CommentWebviewType | 'news' | 'support';

export type JandanWebviewType = Exclude<JandanViewType, 'support'>;

export interface JandanApiResponse<T> {
    code?: number;
    error?: number;
    msg?: string;
    data: T;
}

export interface CommentPostItem {
    id: number | string;
    author: string;
    content?: string;
    images?: string[];
    vote_positive?: number;
    vote_negative?: number;
    sub_comment_count?: number;
    ip_location?: string;
    post_title?: string;
    [key: string]: unknown;
}

export interface CommentPostListData<T extends CommentPostItem = CommentPostItem> {
    current_page: number;
    total_pages: number;
    list: T[];
    [key: string]: unknown;
}

export type CommentPostListResponse<T extends CommentPostItem = CommentPostItem> =
    JandanApiResponse<CommentPostListData<T>>;

export type TopItemsResponse<T extends CommentPostItem = CommentPostItem> = JandanApiResponse<T[]>;

export interface CommentTreeItem extends CommentPostItem {
    comment_ID: string;
    comment_author: string;
    comment_content: string;
    pics: string[];
}

export interface VoteResponse {
    code?: number;
    error?: number;
    msg?: string;
    [key: string]: unknown;
}
