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

export const getTreeholes = async (
    page: number = 0,
    signal?: AbortSignal,
): Promise<RequestResponse<any>> => {
    const response = await request({
        url: '/api/comment/post/102312',
        method: 'GET',
        signal,
        headers: {
            Referer: 'https://jandan.net/treehole',
        },
        params: {
            order: 'desc',
            page: page,
        },
    });
    return response;
};
