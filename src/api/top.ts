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

import { AxiosPromise } from 'axios';
import request from '../request';

export interface TopCategory {
    id: string;
    name: string;
    path: string;
}

export const topCategories: TopCategory[] = [
    {
        id: '4hr',
        name: '4小时热榜',
        path: '/api/top/4hr',
    },
    {
        id: 'pic',
        name: '无聊图',
        path: '/api/top/post/26402',
    },
    {
        id: 'treehole',
        name: '树洞',
        path: '/api/top/post/102312',
    },
    {
        id: 'ooxx',
        name: '随手拍',
        path: '/api/top/post/21183',
    },
    {
        id: 'pic3days',
        name: '3日最佳',
        path: '/api/top/pic3days',
    },
    {
        id: 'pic7days',
        name: '7日最佳',
        path: '/api/top/pic7days',
    },
];

export function getTopItems(category: TopCategory): AxiosPromise<any> {
    return request({
        url: category.path,
        method: 'GET',
        headers: {
            Referer: 'https://jandan.net/top',
        },
    });
}
