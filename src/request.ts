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

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type ResponseType = 'json' | 'text' | 'arrayBuffer';

export interface RequestConfig {
    url: string;
    method?: RequestMethod;
    params?: Record<string, string | number | boolean | null | undefined>;
    data?: unknown;
    headers?: Record<string, string>;
    responseType?: ResponseType;
    signal?: AbortSignal;
}

export interface RequestResponse<T = unknown> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: RequestConfig;
}

export class RequestError<T = unknown> extends Error {
    public constructor(
        message: string,
        public readonly response: RequestResponse<T>,
    ) {
        super(message);
        this.name = 'RequestError';
    }
}

const baseURL = 'https://jandan.net';
const timeout = 10000;
const defaultHeaders: Record<string, string> = {
    Accept: 'application/json, text/html, */*',
    Referer: 'https://jandan.net/',
    'User-Agent': 'Mozilla/5.0',
};

const buildUrl = (url: string, params?: RequestConfig['params']): string => {
    const requestUrl = new URL(url, baseURL);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                requestUrl.searchParams.set(key, String(value));
            }
        });
    }

    return requestUrl.toString();
};

const buildHeaders = (headers?: RequestConfig['headers']): Headers => {
    return new Headers({
        ...defaultHeaders,
        ...headers,
    });
};

const buildBody = (data: unknown, headers: Headers): BodyInit | undefined => {
    if (data === undefined || data === null) {
        return undefined;
    }

    if (
        typeof data === 'string' ||
        data instanceof URLSearchParams ||
        data instanceof ArrayBuffer ||
        data instanceof Blob ||
        data instanceof FormData
    ) {
        return data;
    }

    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    return JSON.stringify(data);
};

const parseData = async (response: Response, responseType?: ResponseType): Promise<unknown> => {
    if (responseType === 'arrayBuffer') {
        return response.arrayBuffer();
    }

    if (responseType === 'text') {
        return response.text();
    }

    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

const headersToObject = (headers: Headers): Record<string, string> => {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
        result[key] = value;
    });
    return result;
};

const request = async <T = unknown>(config: RequestConfig): Promise<RequestResponse<T>> => {
    const method = config.method ?? 'GET';
    const headers = buildHeaders(config.headers);
    const controller = new AbortController();
    const abortRequest = (): void => {
        controller.abort(config.signal?.reason);
    };
    const timer = setTimeout(() => controller.abort(new Error('请求超时')), timeout);

    if (config.signal?.aborted) {
        abortRequest();
    } else {
        config.signal?.addEventListener('abort', abortRequest, { once: true });
    }

    try {
        const response = await fetch(buildUrl(config.url, config.params), {
            method,
            headers,
            body: buildBody(config.data, headers),
            signal: controller.signal,
        });
        const data = await parseData(response, config.responseType);

        const requestResponse: RequestResponse<T> = {
            data: data as T,
            status: response.status,
            statusText: response.statusText,
            headers: headersToObject(response.headers),
            config,
        };

        if (!response.ok) {
            throw new RequestError(
                `Request failed with status code ${response.status}`,
                requestResponse,
            );
        }

        return requestResponse;
    } finally {
        clearTimeout(timer);
        config.signal?.removeEventListener('abort', abortRequest);
    }
};

export default request;
