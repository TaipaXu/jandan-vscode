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
import { type LikeType, type VoteResponse } from './types';

const vote = async (
    id: number | string,
    likeType: LikeType,
): Promise<RequestResponse<VoteResponse>> => {
    const response = await request<VoteResponse>({
        url: '/api/comment/vote',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: {
            comment_id: Number(id),
            like_type: likeType,
            data_type: 'comment',
        },
    });
    return response;
};

export const support = async (id: number | string): Promise<RequestResponse<VoteResponse>> => {
    const response = await vote(id, 'pos');
    return response;
};

export const oppose = async (id: number | string): Promise<RequestResponse<VoteResponse>> => {
    const response = await vote(id, 'neg');
    return response;
};
