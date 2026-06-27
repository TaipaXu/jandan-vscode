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

const isRequestCanceled = (signal: AbortSignal): boolean => {
    return signal.aborted;
};

const getErrorDetail = (error: unknown): string => {
    return error instanceof Error ? error.message : '网络错误';
};

export abstract class AbstractTreeDataProvider implements vscode.TreeDataProvider<Node> {
    private readonly onDidChangeTreeDataEvent = new vscode.EventEmitter<Node | undefined>();
    public readonly onDidChangeTreeData: vscode.Event<Node | undefined> =
        this.onDidChangeTreeDataEvent.event;
    private readonly cache = new Map<string, Node[]>();
    private requestVersion: number = 0;
    private lastSuccessfulPage: number | undefined;
    private pendingRequest:
        | {
              cacheKey: string | undefined;
              controller: AbortController;
              promise: Promise<Node[]>;
              version: number;
          }
        | undefined;
    currentPage: number = 1;
    items: Node[] = [];
    protected isLoading: boolean = false;

    public constructor() {}

    protected abstract getItems(signal: AbortSignal, element?: Node): Promise<Node[]>;

    public getTreeItem(element: Node): vscode.TreeItem {
        return element;
    }

    public prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.fireChange();
        } else {
            vscode.window.showWarningMessage('This is the first page!');
        }
    }

    public nextPage(): void {
        this.currentPage++;
        this.fireChange();
    }

    public refresh(): void {
        this.currentPage = 1;
        this.clearCache();
        this.fireChange();
    }

    protected fireChange(): void {
        this.abortPendingRequest();
        this.onDidChangeTreeDataEvent.fire(undefined);
    }

    protected clearCache(): void {
        this.cache.clear();
    }

    protected getCacheKey(element?: Node): string | undefined {
        return element ? undefined : `page:${this.currentPage}`;
    }

    protected getLoadingMessage(_element?: Node): string {
        return `Loading page: ${this.currentPage}`;
    }

    protected getLoadedMessage(_element?: Node): string {
        return `page: ${this.currentPage}`;
    }

    protected getLoadFailedMessage(error: unknown, _element?: Node): string {
        return `加载失败，已保留当前列表：${getErrorDetail(error)}`;
    }

    public async getChildren(element?: Node): Promise<Node[]> {
        const cacheKey = this.getCacheKey(element);

        if (cacheKey && this.cache.has(cacheKey)) {
            const items = this.cache.get(cacheKey) ?? [];
            this.useCachedItems(element, items);
            return items;
        }

        if (cacheKey && this.pendingRequest?.cacheKey === cacheKey) {
            return this.pendingRequest.promise;
        }

        this.abortPendingRequest();

        const controller = new AbortController();
        const version = ++this.requestVersion;
        const promise = this.loadChildren(element, cacheKey, controller, version);
        this.pendingRequest = {
            cacheKey,
            controller,
            promise,
            version,
        };

        return promise;
    }

    private async loadChildren(
        element: Node | undefined,
        cacheKey: string | undefined,
        controller: AbortController,
        version: number,
    ): Promise<Node[]> {
        this.isLoading = true;
        vscode.window.setStatusBarMessage(this.getLoadingMessage(element));

        try {
            const items = await this.getItems(controller.signal, element);
            if (controller.signal.aborted || version !== this.requestVersion) {
                return this.getFallbackItems(cacheKey, element);
            }

            this.cacheItems(cacheKey, element, items);
            vscode.window.setStatusBarMessage(this.getLoadedMessage(element));
            return items;
        } catch (error) {
            if (!isRequestCanceled(controller.signal)) {
                this.restoreSuccessfulPage(element);
                vscode.window.showWarningMessage(this.getLoadFailedMessage(error, element));
            }

            return this.getFallbackItems(cacheKey, element);
        } finally {
            if (this.pendingRequest?.version === version) {
                this.pendingRequest = undefined;
                this.isLoading = false;
            }
        }
    }

    private cacheItems(
        cacheKey: string | undefined,
        element: Node | undefined,
        items: Node[],
    ): void {
        if (!element) {
            this.items = items;
            this.lastSuccessfulPage = this.currentPage;
        }

        if (cacheKey) {
            this.cache.set(cacheKey, items);
        }

        const currentCacheKey = this.getCacheKey(element);
        if (currentCacheKey && currentCacheKey !== cacheKey) {
            this.cache.set(currentCacheKey, items);
        }
    }

    private useCachedItems(element: Node | undefined, items: Node[]): void {
        if (!element) {
            this.items = items;
            this.lastSuccessfulPage = this.currentPage;
        }

        vscode.window.setStatusBarMessage(this.getLoadedMessage(element));
    }

    private getFallbackItems(cacheKey: string | undefined, element: Node | undefined): Node[] {
        if (cacheKey && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey) ?? [];
        }

        return element ? [] : this.items;
    }

    private restoreSuccessfulPage(element: Node | undefined): void {
        if (!element && this.items.length > 0 && this.lastSuccessfulPage !== undefined) {
            this.currentPage = this.lastSuccessfulPage;
        }
    }

    private abortPendingRequest(): void {
        if (!this.pendingRequest) {
            return;
        }

        this.pendingRequest.controller.abort();
        this.pendingRequest = undefined;
        this.isLoading = false;
    }
}

export class Node extends vscode.TreeItem {
    public constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
    ) {
        super(label, collapsibleState);
    }
}
