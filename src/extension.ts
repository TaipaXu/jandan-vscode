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
import { TopTreeDataProvider } from './tree/topTree';
import { NewsTreeDataProvider } from './tree/newsTree';
import { PicTreeDataProvider } from './tree/picTree';
import { OoxxTreeDataProvider } from './tree/ooxxTree';
import { NvzhuangTreeDataProvider } from './tree/nvzhuangTree';
import { TreeholeTreeDataProvider } from './tree/treeholeTree';
import { QaTreeDataProvider } from './tree/qaTree';
import { SupportTreeDataProvider } from './tree/supportTree';
import { generateHtml } from './webview/generator';
import * as baseApi from './api/base';
import * as newsApi from './api/news';

type LikeType = 'pos' | 'neg';

const vote = async (item: any, likeType: LikeType): Promise<void> => {
    const comment = item?.command?.arguments?.[1] ?? item;
    const commentId = comment?.comment_ID ?? comment?.id;

    if (commentId === undefined || commentId === null) {
        vscode.window.showWarningMessage('无法获取评论 ID！');
        return;
    }

    try {
        const response =
            likeType === 'pos' ? await baseApi.support(commentId) : await baseApi.oppose(commentId);

        if (response.status === 200) {
            const result = response.data?.error ?? response.data?.code;
            const message = response.data?.msg;
            if (result === 0) {
                vscode.window.showInformationMessage('投票成功！');
            } else if (message) {
                vscode.window.showWarningMessage(message);
            } else if (result === 1) {
                vscode.window.showWarningMessage('您已经投过票了');
            } else {
                vscode.window.showWarningMessage('投票失败！');
            }
        }
    } catch {
        vscode.window.showWarningMessage('网络错误！');
    }
};

export const activate = (context: vscode.ExtensionContext): void => {
    const topDataProvider: TopTreeDataProvider = new TopTreeDataProvider();
    const newsDataProvider: NewsTreeDataProvider = new NewsTreeDataProvider();
    const picDataProvider: PicTreeDataProvider = new PicTreeDataProvider();
    const ooxxDataProvider: OoxxTreeDataProvider = new OoxxTreeDataProvider();
    const nvzhuangDataProvider: NvzhuangTreeDataProvider = new NvzhuangTreeDataProvider();
    const treeholeDataProvider: TreeholeTreeDataProvider = new TreeholeTreeDataProvider();
    const qaDataProvider: QaTreeDataProvider = new QaTreeDataProvider();
    const supportDataProvider: SupportTreeDataProvider = new SupportTreeDataProvider();

    vscode.window.registerTreeDataProvider('top', topDataProvider);
    vscode.window.registerTreeDataProvider('news', newsDataProvider);
    vscode.window.registerTreeDataProvider('pic', picDataProvider);
    vscode.window.registerTreeDataProvider('ooxx', ooxxDataProvider);
    vscode.window.registerTreeDataProvider('nvzhuang', nvzhuangDataProvider);
    vscode.window.registerTreeDataProvider('treehole', treeholeDataProvider);
    vscode.window.registerTreeDataProvider('qa', qaDataProvider);
    vscode.window.registerTreeDataProvider('support', supportDataProvider);

    let webviewOpened = false;
    let webviewPanel: vscode.WebviewPanel;

    context.subscriptions.push(
        vscode.commands.registerCommand('jandan.topRefresh', () => {
            topDataProvider.refresh();
        }),
        vscode.commands.registerCommand('jandan.newsPrevious', () => {
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
        vscode.commands.registerCommand('jandan.nvzhuangPrevious', () => {
            nvzhuangDataProvider.prevPage();
        }),
        vscode.commands.registerCommand('jandan.nvzhuangNext', () => {
            nvzhuangDataProvider.nextPage();
        }),
        vscode.commands.registerCommand('jandan.nvzhuangRefresh', () => {
            nvzhuangDataProvider.refresh();
        }),
        vscode.commands.registerCommand('jandan.treeholePrevious', () => {
            treeholeDataProvider.prevPage();
        }),
        vscode.commands.registerCommand('jandan.treeholeNext', () => {
            treeholeDataProvider.nextPage();
        }),
        vscode.commands.registerCommand('jandan.treeholeRefresh', () => {
            treeholeDataProvider.refresh();
        }),
        vscode.commands.registerCommand('jandan.qaPrevious', () => {
            qaDataProvider.prevPage();
        }),
        vscode.commands.registerCommand('jandan.qaNext', () => {
            qaDataProvider.nextPage();
        }),
        vscode.commands.registerCommand('jandan.qaRefresh', () => {
            qaDataProvider.refresh();
        }),
        vscode.commands.registerCommand('jandan.oo', async (item: any) => {
            await vote(item, 'pos');
        }),
        vscode.commands.registerCommand('jandan.xx', async (item: any) => {
            await vote(item, 'neg');
        }),
        vscode.commands.registerCommand('jandan.select', async (type: string, item: any) => {
            if (type === 'support') {
                vscode.env.openExternal(vscode.Uri.parse(item));
            } else {
                if (type === 'news' && item.url && !item.contentLoaded) {
                    try {
                        const response = await newsApi.getNewsContent(item.url);
                        item.content = response.data || item.content;
                        item.contentLoaded = true;
                    } catch {
                        vscode.window.showWarningMessage('网络错误！');
                    }
                }

                if (!webviewOpened) {
                    webviewPanel = vscode.window.createWebviewPanel(
                        'JanDan',
                        'JanDan',
                        vscode.ViewColumn.One,
                        {
                            enableScripts: true,
                        },
                    );
                    webviewOpened = true;
                    webviewPanel.onDidDispose(() => {
                        webviewOpened = false;
                    });
                }
                const html: string = generateHtml(context, type, item);
                webviewPanel.webview.html = html;
                webviewPanel.webview.postMessage({
                    type: 'init',
                });
            }
        }),
    );
};

export const deactivate = (): void => {};
