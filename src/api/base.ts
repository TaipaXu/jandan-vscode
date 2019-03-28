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
const FormData = require('form-data');
import request from '../request';


export function support(id: string): AxiosPromise<any> {
    const form = new FormData();
    form.append('ID', id);

    return request({
        url: '/jandan-vote.php',
        method: 'POST',
        headers: form.getHeaders(),
        params: {
            acv_ajax: true,
            option: 1
        },
        data: form
    });
}

export function oppose(id: string): AxiosPromise<any> {
    const form = new FormData();
    form.append('ID', id);

    return request({
        url: '',
        method: 'POST',
        headers: form.getHeaders(),
        params: {
            acv_ajax: true,
            option: 0
        },
        data: form
    });
}
