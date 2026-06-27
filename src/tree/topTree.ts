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
import { type CommentTreeItem } from '../api/types';
import { AbstractTreeDataProvider, Node } from './abstractTree';
import * as topApi from '../api/top';
import { normalizeCommentItem } from './commentUtils';

class TopCategoryNode extends Node {
    public constructor(public readonly category: topApi.TopCategory) {
        super(category.name, vscode.TreeItemCollapsibleState.Collapsed);
        this.id = `top-category-${category.id}`;
        this.contextValue = 'topCategory';
    }
}

class TopItemNode extends Node {
    public constructor(categoryId: string, rank: number, item: CommentTreeItem) {
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
    public refresh(): void {
        this.clearCache();
        this.fireChange();
    }

    protected getCacheKey(element?: Node): string | undefined {
        if (!element) {
            return 'top:categories';
        }

        if (element instanceof TopCategoryNode) {
            return `top:${element.category.id}`;
        }

        return undefined;
    }

    protected getLoadingMessage(element?: Node): string {
        if (element instanceof TopCategoryNode) {
            return `Loading ${element.category.name}`;
        }

        return 'Loading top';
    }

    protected getLoadedMessage(element?: Node): string {
        if (element instanceof TopCategoryNode) {
            return element.category.name;
        }

        return 'top';
    }

    protected async getItems(signal: AbortSignal, element?: Node): Promise<Node[]> {
        if (!element) {
            return topApi.topCategories.map((category) => new TopCategoryNode(category));
        }

        if (element instanceof TopCategoryNode) {
            return this.getCategoryItems(element.category, signal);
        }

        return [];
    }

    private async getCategoryItems(
        category: topApi.TopCategory,
        signal: AbortSignal,
    ): Promise<Node[]> {
        const response = await topApi.getTopItems(category, signal);
        const data = response.data.data;
        if (!Array.isArray(data)) {
            throw new Error('数据格式异常');
        }

        return data.map(
            (element, index) =>
                new TopItemNode(category.id, index + 1, normalizeCommentItem(element)),
        );
    }
}
