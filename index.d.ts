import { ErreStream } from 'erre'
import { TokensToRegexpOptions, ParseOptions, pathToRegexp } from 'path-to-regexp'

type Callback = (...args: any[]) => any

export type URLWithParams = URL & { params: Record<string, string> }
export type RawthOptions = TokensToRegexpOptions & ParseOptions & {
    base: string
    silentErrors: boolean
}

// internal methods that probably you will never use by yourselves
export declare const toRegexp: typeof pathToRegexp
export declare const toPath: (path: string, params: Record<string, string>, options: RawthOptions) => string
export declare const toURL: (path: string, pathRegExp: RegExp, options: RawthOptions) => URLWithParams
export declare const match: (path: string, pathRegExp: RegExp) => boolean
export declare const createURLStreamPipe: (pathRegExp: RegExp, options: RawthOptions) => Callback[]

// public API
export declare const router: ErreStream<string, string, string>
export declare const defaults: RawthOptions
export declare const configure: (options: Partial<RawthOptions>) => RawthOptions
export declare function route(path: string): ErreStream<URLWithParams, URLWithParams, URLWithParams>
export default route
