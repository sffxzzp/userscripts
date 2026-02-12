// ==UserScript==
// @name         Steam Store Video Downloader
// @namespace    https://github.com/sffxzzp
// @version      0.30
// @description  add download button in store page to get videos.
// @author       sffxzzp
// @match        *://store.steampowered.com/app/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/storevideodownloader.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/storevideodownloader.user.js
// ==/UserScript==

(function() {
    var carousel = document.querySelector("div.gamehighlight_desktopcarousel");
    var observer = new MutationObserver(function (recs) {
        if (carousel.children[0].children.length == 4) {
            loadBtn();
        }
    });
    observer.observe(carousel, { childList: true, subtree: true });

    async function startDownload(m3u8Url, appid) {
        if (!('showDirectoryPicker' in window)) {
            console.error('❌ 请使用 Chrome/Edge 桌面版');
            return;
        }

        try {
            const resolveUrl = (base, relative) => new URL(relative, base).href;

            // 0. 获取 Master Playlist
            console.log('🔍 正在获取播放列表:', m3u8Url);
            const response = await fetch(m3u8Url);
            if (!response.ok) throw new Error(`Fetch error: ${response.status}`);
            const content = await response.text();

            let videoUrl = m3u8Url;
            let audioUrl = null;
            let audioGroupId = null;

            // 1. 解析 Master Playlist (寻找最高画质 + 分离音频)
            if (content.includes('#EXT-X-STREAM-INF')) {
                console.log('检测到 Master Playlist...');
                const lines = content.split('\n');
                let maxBandwidth = 0;

                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes('BANDWIDTH=')) {
                        const bandwidthMatch = lines[i].match(/BANDWIDTH=(\d+)/);
                        if (bandwidthMatch) {
                            const bandwidth = parseInt(bandwidthMatch[1]);
                            if (bandwidth > maxBandwidth) {
                                maxBandwidth = bandwidth;
                                const audioMatch = lines[i].match(/AUDIO="([^"]+)"/);
                                audioGroupId = audioMatch ? audioMatch[1] : null;

                                let nextLine = lines[i+1]?.trim();
                                if (nextLine && !nextLine.startsWith('#')) {
                                    videoUrl = resolveUrl(m3u8Url, nextLine);
                                }
                            }
                        }
                    }
                }

                if (audioGroupId) {
                    console.log(`🎵 发现分离音频组: ${audioGroupId}`);
                    for (let line of lines) {
                        if (line.startsWith('#EXT-X-MEDIA') && line.includes('TYPE=AUDIO') && line.includes(`GROUP-ID="${audioGroupId}"`)) {
                            const uriMatch = line.match(/URI="([^"]+)"/);
                            if (uriMatch) {
                                audioUrl = resolveUrl(m3u8Url, uriMatch[1]);
                                break;
                            }
                        }
                    }
                }
            }

            console.log(`📹 视频任务: ${videoUrl}`);
            if (audioUrl) console.log(`🎵 音频任务: ${audioUrl}`);

            // 2. 选择目录
            const dirHandle = await window.showDirectoryPicker();

            // 3. 通用下载函数 (核心修复：支持 Init Segment)
            const downloadStream = async (url, baseFilename) => {
                console.log(`🚀 [${baseFilename}] 开始解析...`);
                const res = await fetch(url);
                const text = await res.text();

                // 检查加密
                if (text.includes('#EXT-X-KEY')) {
                    console.error(`⚠️⚠️⚠️ [${baseFilename}] 检测到加密 (#EXT-X-KEY)！下载后绝对无法播放！请放弃或寻找解密方案。`);
                }

                const tsUrls = [];
                let initSegmentUrl = null;

                text.split('\n').forEach(line => {
                    line = line.trim();
                    // 关键修复：检测 EXT-X-MAP
                    if (line.startsWith('#EXT-X-MAP')) {
                        const uriMatch = line.match(/URI="([^"]+)"/);
                        if (uriMatch) {
                            initSegmentUrl = resolveUrl(url, uriMatch[1]);
                            console.log(`ℹ️ [${baseFilename}] 发现初始化片段 (Map): ${initSegmentUrl}`);
                        }
                    } else if (line && !line.startsWith('#')) {
                        tsUrls.push(resolveUrl(url, line));
                    }
                });

                if (tsUrls.length === 0) throw new Error(`[${baseFilename}] 未找到片段`);

                // 智能判定后缀
                let ext = '.ts';
                if (initSegmentUrl || tsUrls[0].includes('.m4s') || tsUrls[0].includes('.mp4')) {
                    ext = '.mp4'; // fMP4 容器通常用 mp4 后缀
                }
                const finalFilename = baseFilename + ext;

                const fileHandle = await dirHandle.getFileHandle(finalFilename, { create: true });
                const writable = await fileHandle.createWritable();

                // 优先下载 Init Segment
                if (initSegmentUrl) {
                    console.log(`📥 [${finalFilename}] 下载 Init SegmentHeader...`);
                    const r = await fetch(initSegmentUrl);
                    if (!r.ok) throw new Error(`Init DL Error: ${r.status}`);
                    await writable.write(await r.arrayBuffer());
                }

                // 下载正文片段
                for (let i = 0; i < tsUrls.length; i++) {
                    let retry = 0;
                    let success = false;
                    while (retry < 3 && !success) {
                        try {
                            const r = await fetch(tsUrls[i]);
                            if (!r.ok) throw new Error(r.statusText);
                            await writable.write(await r.arrayBuffer());
                            success = true;
                        } catch (e) {
                            retry++;
                            await new Promise(r => setTimeout(r, 1000));
                        }
                    }
                    if (!success) throw new Error(`[${finalFilename}] 片段 ${i+1} 失败`);

                    if ((i+1) % 20 === 0) console.log(`[${finalFilename}] 进度 ${Math.round((i+1)/tsUrls.length*100)}%`);
                }

                await writable.close();
                console.log(`✅ [${finalFilename}] 完成！`);
            };

            const tasks = [];
            tasks.push(downloadStream(videoUrl, 'video_'+appid));
            if (audioUrl) {
                tasks.push(downloadStream(audioUrl, 'audio_'+appid));
            }

            await Promise.all(tasks);
            console.log('🎉 全部完成！');
            alert('下载完成！');

        } catch (err) {
            console.error('❌ 错误:', err);
            alert('出错: ' + err.message);
        }
    }

    function loadBtn() {
        if (unsafeWindow.ssvdLoaded) {
            return;
        }
        unsafeWindow.ssvdLoaded = true;
        let trailers = JSON.parse(document.querySelector('div.gamehighlight_desktopcarousel').dataset.props).trailers;
        let appid = document.querySelector('div.game').dataset.miniprofileAppid;
        document.querySelectorAll('div.gamehighlight_desktopcarousel >div > div:last-child > div:first-child > div:has(svg.SVGIcon_Button)').forEach(function (node) {
            let imgSrc = node.querySelector('img').src;
            let mUrl = '';
            let found264 = false;
            let target;
            for (let trailer of trailers) {
                if (trailer.thumbnail == imgSrc) {
                    target = trailer;
                }
            }
            if (target) {
                for (let u of target.hlsManifest) {
                    if (u.indexOf('h264') > 0) {
                        mUrl = u;
                        found264 = true;
                    }
                }
                if (found264 == false) {
                    mUrl = target.hlsManifest;
                }
                if (mUrl) {
                    node.ondblclick = function () {
                        // prompt("url: ", mUrl);
                        startDownload(mUrl, appid);
                    }
                } else {
                    node.ondblclick = function () {
                        alert('no url found.');
                    }
                }
            } else {
                node.ondblclick = function () {
                    alert('no url found.')
                }
            }
        });
    }
})();
