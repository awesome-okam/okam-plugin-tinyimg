/**
 * @file tinyPng.js
 */

'use strict';

const fs = require('fs');
const pathUtil = require('path');
const mkdirp = require('mkdirp');
const tiny = require('./tinypng');

// 缓存记录文件
const cacheName = '.tinyimgcache';

let hasCacheFile = false;
let cacheFileContent = '';

function md5(data, encoding) {
    let crypto = require('crypto');
    let md5 = crypto.createHash('md5');
    if (!encoding) {
        encoding = typeof data === 'string' ? 'utf8' : 'binary';
    }
    md5.update(data, encoding);
    return md5.digest('hex');
}

class TinyImg {

    /**
     * constructor
     *
     * @param {Object} file 文件相关信息
     * @param {Object} options 配置项
     */
    constructor(file, options) {
        this.file = file;
        this.options = options;

        this.initOptions(options);
        this.prepare();

        return this;
    }

    /**
     * 初始化参数
     *
     * @param {Object} options 参数配置
     */
    initOptions(options) {
        this.logger = options.logger;
        this.root = options.root;

        this.cacheListPath = pathUtil.join(options.root, cacheName);

        const config = options.config;

        const releaseSourceBaseDir = pathUtil.resolve(
            this.root, config.releaseSourcePath || 'doc/img'
        );

        const originalImgMd5 = md5(this.file.content);

        // 源文件信息
        const {base, dir} = pathUtil.parse(this.file.path);
        this.processConfig = {
            // boolean 是否替换源文件
            replaceRaw: config.replaceRaw || false,
            // 原文件存放的路径
            releaseSourceBaseDir,

            // string 若替换的话，原文件存放的路径, 默认放 root 下的 doc 中
            releaseSourceDir: pathUtil.join(releaseSourceBaseDir, dir),
            releaseSourcePath: pathUtil.join(releaseSourceBaseDir, this.file.path),

            // 源文件md5
            originalImgMd5,

            // 存在本地的压缩命名
            cachePath: `${originalImgMd5}-${base}`
        };

        // 压缩后的内容
        this.resultContent = '';
    }

    /**
     * 压缩前处理
     */
    prepare() {
        // 记录已压缩文件的缓存文件
        let cacheListPath = this.cacheListPath;

        if (!hasCacheFile) {
            hasCacheFile = true;

            if (!fs.existsSync(cacheListPath)) {
                this.processConfig.replaceRaw && fs.createWriteStream(cacheListPath);
            }
            else {
                cacheFileContent = fs.readFileSync(cacheListPath, 'utf-8');
            }
        }
    }


    compress() {
        if (!this.isSupport(this.file.extname)) {
            this.logger.warn(`${this.file.path} skipped`);
            this.logger.debug(`reason: This type does not support`);
        }

        if (this.hasCompressed() || this.hasCached()) {
            return {
                content: this.resultContent
            };
        }

        return this.tinyFile();
    }

    /**
     * 是否支持，不支持的直接跳过
     */
    isSupport(type) {
        type = type.toLowerCase();
        return /^(jpe?g|png)$/.test(type);
    }

    /**
     * 是否已经压缩过
     *
     * @return {boolean} true | false
     */
    hasCompressed() {
        const originalImgMd5 = this.processConfig.originalImgMd5;
        const {path, content} = this.file;
        // 若为已压缩文件，直接返回，不进行备份
        if (cacheFileContent.indexOf(`|compressed:${originalImgMd5}|`) >= 0) {
            this.resultContent = content;
            this.logger.info(`${path} has already been compressed`);
            return true;
        }

        return false;
    }

    /**
     * 是否有缓存
     *
     * @return {boolean} true | false
     */
    hasCached() {
        const cache = this.options.cache;

        const cachePath = this.processConfig.cachePath;

        // 已有缓存 则读取缓存，需进行备份
        const fileCacheCompressed = cache.readCacheFile(cachePath);

        if (fileCacheCompressed) {
            this.resultContent = fileCacheCompressed;
            this.logger.info(`${this.file.path} compressed by cache ${cache.cacheDir}`);

            // 原文件替换
            this.addCacheRecordAndReplace(fileCacheCompressed);
            return true;
        }

        return false;
    }

    /**
     * 如果为true 则替换原文件
     *
     * @param  {Object} compressedFile 压缩后的文件
     */
    addCacheRecordAndReplace(compressedFile) {
        const {replaceRaw, releaseSourceDir, releaseSourcePath, originalImgMd5} = this.processConfig;

        if (!replaceRaw) {
            return;
        }

        const {path, fullPath, content} = this.file;

        // 先存
        mkdirp.sync(releaseSourceDir);
        fs.writeFileSync(releaseSourcePath, content);
        let cacheRelSourceDir = pathUtil.relative(this.root, releaseSourceDir);
        this.logger.info(`source file ${path} has been move to ${cacheRelSourceDir}`);

        // 后换
        fs.writeFileSync(fullPath, compressedFile);
        this.logger.info(`${path} has been replaced`);


        // 添加记录
        let compressedImgMd5 = md5(compressedFile);
        if (cacheFileContent.indexOf(`|compressed:${compressedImgMd5}|`) >= 0) {
            return;
        }
        fs.appendFileSync(
            this.cacheListPath,
            `|compressed:${compressedImgMd5}|original:${originalImgMd5}|path:${path}|\n`
        );
    }


    /**
     * 图片压缩
     *
     * @return {Object} promise
     */
    tinyFile() {
        const {content, path} = this.file;
        const cachePath = this.processConfig.cachePath;

        return new Promise((resolve, reject) => {
            tiny(content, (error, res) => {
                if (error) {
                    this.logger.warn(`${path} skipped`);
                    this.logger.error(`reason: ${error}`);
                    // 如果出错直接返回原文件
                    resolve({
                        content: content
                    });
                    return;
                }

                let data = res.file;
                this.resultContent = data || '';
                const compressionRatio = (100 - 100 * res.output.ratio).toFixed(2);
                this.logger.info(`${path} compressed [${res.input.size}->${res.output.size}](${compressionRatio}%)`);

                // 缓存标记 & 原文件替换
                this.addCacheRecordAndReplace(data);

                this.options.cache.cacheFile(data, cachePath);
                this.logger.info(`${path} has been cached`);

                resolve({
                    content: this.resultContent
                });
            });
        });
    }
}


module.exports = exports = TinyImg;
