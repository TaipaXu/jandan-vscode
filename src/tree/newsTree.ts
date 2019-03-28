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

import * as vscode from 'vscode';
import { AbstractTreeDataProvider, Node } from './abstractTree';
import * as newsApi from '../api/news';

export class NewsTreeDataProvider extends AbstractTreeDataProvider {
    protected async getItems(): Promise<Array<Node>> {
        let response: any = await newsApi.getNews(this.currentPage);
        let items: Array<Node> = [];
        response.data.posts.forEach((element: any) => {
            items.push(new Node(
                element.title,
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'jandan.select',
                    title: '',
                    arguments: ['news', element]
                }
            ));
        });
        return items;
    }
}
