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
import * as nvzhuangApi from '../api/nvzhuang';

const imageSrcRegexp = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;

const getImageUrls = (content: string): string[] => {
    const urls: string[] = [];
    let match: RegExpExecArray | null;

    imageSrcRegexp.lastIndex = 0;
    while ((match = imageSrcRegexp.exec(content)) !== null) {
        urls.push(match[1]);
    }

    return urls;
};

export class NvzhuangTreeDataProvider extends AbstractTreeDataProvider {
    private totalPages: number = 0;

    public constructor() {
        super();
        this.currentPage = 0;
    }

    public prevPage(): void {
        if (this.currentPage > 0 && this.currentPage < this.totalPages) {
            this.currentPage++;
            this.fireChange();
        } else {
            vscode.window.showWarningMessage('This is the first page!');
        }
    }

    public nextPage(): void {
        if (this.currentPage === 0) {
            this.fireChange();
        } else if (this.currentPage > 1) {
            this.currentPage--;
            this.fireChange();
        } else {
            vscode.window.showWarningMessage('This is the last page!');
        }
    }

    public refresh(): void {
        this.currentPage = 0;
        this.totalPages = 0;
        this.fireChange();
    }

    public async getItems(): Promise<Node[]> {
        const response: any = await nvzhuangApi.getNvzhuangs(this.currentPage);
        const data = response.data.data;
        const items: Array<Node> = [];
        if (!data || !Array.isArray(data.list)) {
            return items;
        }

        this.totalPages = data.total_pages;
        this.currentPage = data.current_page;

        data.list.forEach((element: any) => {
            const content = element.content || '';
            const nvzhuangItem = {
                ...element,
                comment_ID: String(element.id),
                comment_author: element.author,
                comment_content: content,
                pics: getImageUrls(content),
            };

            const node = new Node(
                nvzhuangItem.comment_author,
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'jandan.select',
                    title: '',
                    arguments: ['nvzhuang', nvzhuangItem],
                },
            );
            node.id = `nvzhuang-${nvzhuangItem.comment_ID}`;
            items.push(node);
        });
        return items;
    }
}
