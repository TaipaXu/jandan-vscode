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

export abstract class AbstractTreeDataProvider implements vscode.TreeDataProvider<Node> {
    private onDidChangeTreeDataEvent: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    public readonly onDidChangeTreeData: vscode.Event<any> = this.onDidChangeTreeDataEvent.event;
    currentPage: number = 1;
    items: Array<Node> = [];

    public constructor() { }

    protected abstract getItems(): Promise<Array<Node>>;

    public getTreeItem(element: Node): vscode.TreeItem {
        return element;
    }

    public prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.onDidChangeTreeDataEvent.fire(undefined);
        } else {
            vscode.window.showWarningMessage('This is the first page!');
        }
    }

    public nextPage(): void {
        this.currentPage++;
        this.onDidChangeTreeDataEvent.fire(undefined);
    }

    public refresh(): void {
        this.currentPage = 1;
        this.onDidChangeTreeDataEvent.fire(undefined);
    }

    public getChildren(element?: Node): Promise<Node[]> {
        return new Promise(async (resolve) => {
            this.items = await this.getItems();
            vscode.window.setStatusBarMessage(`page: ${this.currentPage}`);
            return resolve(this.items);
        });
    }
}

export class Node extends vscode.TreeItem {
    public constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }
}
