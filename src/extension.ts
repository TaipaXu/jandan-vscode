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
import { type CommentTreeItem, type CommentWebviewType, type LikeType } from './api/types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

const getCommandPayload = (item: unknown): unknown => {
    if (!isRecord(item) || !isRecord(item.command)) {
        return item;
    }

    const args = item.command.arguments;
    return Array.isArray(args) ? (args[1] ?? item) : item;
};

const getCommentId = (item: unknown): number | string | undefined => {
    const comment = getCommandPayload(item);
    if (!isRecord(comment)) {
        return undefined;
    }

    const id = comment.comment_ID ?? comment.id;
    return typeof id === 'number' || typeof id === 'string' ? id : undefined;
};

const isNewsPost = (item: unknown): item is newsApi.NewsPost => {
    return (
        isRecord(item) &&
        typeof item.url === 'string' &&
        typeof item.content === 'string' &&
        typeof item.contentLoaded === 'boolean'
    );
};

const isCommentTreeItem = (item: unknown): item is CommentTreeItem => {
    return (
        isRecord(item) &&
        typeof item.comment_ID === 'string' &&
        typeof item.comment_author === 'string' &&
        typeof item.comment_content === 'string' &&
        Array.isArray(item.pics)
    );
};

const commentWebviewTypes: readonly CommentWebviewType[] = [
    'pic',
    'ooxx',
    'nvzhuang',
    'treehole',
    'qa',
    'top',
    'talk',
];

const isCommentWebviewType = (type: string): type is CommentWebviewType => {
    return commentWebviewTypes.includes(type as CommentWebviewType);
};

const vote = async (item: unknown, likeType: LikeType): Promise<void> => {
    const commentId = getCommentId(item);

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
    let webviewPanel: vscode.WebviewPanel | undefined;

    const getWebviewPanel = (): vscode.WebviewPanel => {
        if (!webviewOpened || !webviewPanel) {
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
                webviewPanel = undefined;
            });
        }

        return webviewPanel;
    };

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
        vscode.commands.registerCommand('jandan.oo', async (item: unknown) => {
            await vote(item, 'pos');
        }),
        vscode.commands.registerCommand('jandan.xx', async (item: unknown) => {
            await vote(item, 'neg');
        }),
        vscode.commands.registerCommand('jandan.select', async (type: string, item: unknown) => {
            if (type === 'support') {
                if (typeof item === 'string') {
                    vscode.env.openExternal(vscode.Uri.parse(item));
                }
                return;
            }

            if (type === 'news') {
                if (!isNewsPost(item)) {
                    vscode.window.showWarningMessage('数据格式异常');
                    return;
                }

                if (item.url && !item.contentLoaded) {
                    try {
                        const response = await newsApi.getNewsContent(item.url);
                        item.content = response.data || item.content;
                        item.contentLoaded = true;
                    } catch {
                        vscode.window.showWarningMessage('网络错误！');
                    }
                }

                const html: string = generateHtml(context, type, item);
                const panel = getWebviewPanel();
                panel.webview.html = html;
                panel.webview.postMessage({
                    type: 'init',
                });
                return;
            }

            if (!isCommentWebviewType(type) || !isCommentTreeItem(item)) {
                vscode.window.showWarningMessage('数据格式异常');
                return;
            }

            const html: string = generateHtml(context, type, item);
            const panel = getWebviewPanel();
            panel.webview.html = html;
            panel.webview.postMessage({
                type: 'init',
            });
        }),
    );
};

export const deactivate = (): void => {};
