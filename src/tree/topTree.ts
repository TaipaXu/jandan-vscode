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
import * as topApi from '../api/top';

const imageSrcRegexp = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;

function getImageUrls(content: string): string[] {
    const urls: string[] = [];
    let match: RegExpExecArray | null;

    imageSrcRegexp.lastIndex = 0;
    while ((match = imageSrcRegexp.exec(content)) !== null) {
        urls.push(match[1]);
    }

    return urls;
}

function normalizeTopItem(element: any): any {
    const content = element.content || '';

    return {
        ...element,
        comment_ID: String(element.id),
        comment_author: element.author,
        comment_content: content,
        pics: Array.isArray(element.images) ? element.images : getImageUrls(content),
    };
}

class TopCategoryNode extends Node {
    public constructor(public readonly category: topApi.TopCategory) {
        super(category.name, vscode.TreeItemCollapsibleState.Collapsed);
        this.id = `top-category-${category.id}`;
        this.contextValue = 'topCategory';
    }
}

class TopItemNode extends Node {
    public constructor(categoryId: string, rank: number, item: any) {
        const positive = item.vote_positive ?? 0;
        const negative = item.vote_negative ?? 0;

        super(`#${rank} ${item.comment_author}`, vscode.TreeItemCollapsibleState.None, {
            command: 'jandan.select',
            title: '',
            arguments: ['top', item],
        });

        this.id = `top-${categoryId}-${item.comment_ID}`;
        this.contextValue = 'voteable';
        this.description = `${positive} oo / ${negative} xx`;
        this.tooltip = [
            item.post_title,
            `作者: ${item.comment_author}`,
            `oo: ${positive}`,
            `xx: ${negative}`,
            item.sub_comment_count ? `回复: ${item.sub_comment_count}` : '',
            item.ip_location ? `IP: ${item.ip_location}` : '',
        ]
            .filter(Boolean)
            .join('\n');
    }
}

export class TopTreeDataProvider extends AbstractTreeDataProvider {
    private readonly cache = new Map<string, Node[]>();

    public refresh(): void {
        this.cache.clear();
        this.fireChange();
    }

    public async getChildren(element?: Node): Promise<Node[]> {
        if (!element) {
            return topApi.topCategories.map((category) => new TopCategoryNode(category));
        }

        if (element instanceof TopCategoryNode) {
            return this.getCategoryItems(element.category);
        }

        return [];
    }

    protected async getItems(): Promise<Node[]> {
        return topApi.topCategories.map((category) => new TopCategoryNode(category));
    }

    private async getCategoryItems(category: topApi.TopCategory): Promise<Node[]> {
        const cachedItems = this.cache.get(category.id);
        if (cachedItems) {
            return cachedItems;
        }

        const response: any = await topApi.getTopItems(category);
        const data = response.data.data;
        const items = Array.isArray(data)
            ? data.map(
                  (element: any, index: number) =>
                      new TopItemNode(category.id, index + 1, normalizeTopItem(element)),
              )
            : [];

        this.cache.set(category.id, items);
        return items;
    }
}
