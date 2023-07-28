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
import { NewsTreeDataProvider } from './tree/newsTree';
import { PicTreeDataProvider } from './tree/picTree';
import { OoxxTreeDataProvider } from './tree/ooxxTree';
import { SupportTreeDataProvider } from './tree/supportTree';
import { generateHtml } from './webview/generator';
import * as baseApi from './api/base';

export function activate(context: vscode.ExtensionContext): void {
    const newsDataProvider: NewsTreeDataProvider = new NewsTreeDataProvider();
    const picDataProvider: PicTreeDataProvider = new PicTreeDataProvider();
    const ooxxDataProvider: OoxxTreeDataProvider = new OoxxTreeDataProvider();
    const supportDataProvider: SupportTreeDataProvider = new SupportTreeDataProvider();

    vscode.window.registerTreeDataProvider('news', newsDataProvider);
    vscode.window.registerTreeDataProvider('pic', picDataProvider);
    vscode.window.registerTreeDataProvider('ooxx', ooxxDataProvider);
    vscode.window.registerTreeDataProvider('support', supportDataProvider);

    let webviewOpened: Boolean = false;
    let webviewPanel: vscode.WebviewPanel;

    context.subscriptions.push(
        vscode.commands.registerCommand('jandan.newsPrevious', (item: any) => {
            newsDataProvider.prevPage();
        }),
        vscode.commands.registerCommand('jandan.newsNext', () => {
            newsDataProvider.nextPage();
        }),
        vscode.commands.registerCommand('jandan.newsRefresh', () => {
            newsDataProvider.refresh();
        }),
        vscode.commands.registerCommand('jandan.picPrevious', () => {
            picDataProvider.prevPage();
        }),
        vscode.commands.registerCommand('jandan.picNext', () => {
            picDataProvider.nextPage();
        }),
        vscode.commands.registerCommand('jandan.picRefresh', () => {
            picDataProvider.refresh();
        }),
        vscode.commands.registerCommand('jandan.ooxxPrevious', () => {
            ooxxDataProvider.prevPage();
        }),
        vscode.commands.registerCommand('jandan.ooxxNext', () => {
            ooxxDataProvider.nextPage();
        }),
        vscode.commands.registerCommand('jandan.ooxxRefresh', () => {
            ooxxDataProvider.refresh();
        }),
        vscode.commands.registerCommand('jandan.oo', async (item: any) => {
            try {
                let response = await baseApi.support(item.command.arguments[1].comment_ID);
                if (response.status === 200) {
                    let result: 0 | 1 = response.data.error;
                    if (result === 0) {
                        vscode.window.showInformationMessage('投票成功！');
                    } else if (result === 1) {
                        vscode.window.showWarningMessage('您已投票！');
                    }
                }
            } catch (error) {
                vscode.window.showWarningMessage('网络错误！');
            }

        }),
        vscode.commands.registerCommand('jandan.xx', async (item: any) => {
            try {
                let response = await baseApi.oppose(item.command.arguments[1].comment_ID);
                if (response.status === 200) {
                    let result: 0 | 1 = response.data.error;
                    if (result === 0) {
                        vscode.window.showInformationMessage('投票成功！');
                    } else if (result === 1) {
                        vscode.window.showWarningMessage('您已投票！');
                    }
                }
            } catch (error) {
                vscode.window.showWarningMessage('网络错误！');
            }
        }),
        vscode.commands.registerCommand('jandan.select', (type: string, item: any) => {
            if (type === 'support') {
                vscode.env.openExternal(vscode.Uri.parse(item));
            } else {
                if (!webviewOpened) {
                    webviewPanel = vscode.window.createWebviewPanel(
                        'JanDan',
                        'JanDan',
                        vscode.ViewColumn.One,
                        {
                            enableScripts: true
                        }
                    );
                    webviewOpened = true;
                    webviewPanel.onDidDispose(() => {
                        webviewOpened = false;
                    });
                }
                let html: string = generateHtml(context, type, item);
                webviewPanel.webview.html = html;
            }
        }),
    );

}

export function deactivate() { }
