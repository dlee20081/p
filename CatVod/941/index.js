/**
 * 941影视 猫源JS Spider
 * 四壳协议: TVBox / 影视仓 / OK影视 / PickTV
 * AES-128-CBC 加密API, m3u8直链
 */
var createSpider = function (utils) {
    var CryptoJS = utils.crypto;
    var req = utils.request;
    var base = "https://0lyjne.941ct.cc/api";
    var host = "https://0lyjne.941ct.cc";
    var aesKey = CryptoJS.enc.Utf8.parse("a9yX32LpQvUt7wBc");
    var aesIv = CryptoJS.enc.Utf8.parse("N7cPk2Bv38hWqFzM");
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    var minorIds = {"2219": 1, "2218": 1, "2185": 1, "2805": 1};

    var classicalMap = {
        "成人": "风月", "色情": "春宫", "性爱": "云雨", "淫": "风月", "黄色": "春宫",
        "淫秽": "猥亵", "激情": "云雨", "做爱": "云雨", "性交": "交欢", "性行为": "云雨",
        "欲": "情思", "高潮": "云端", "偷拍": "窥帘", "偷窥": "窥帘",
        "乱伦": "禁脔", "强奸": "强占", "轮奸": "群辱", "迷奸": "迷占",
        "无码": "素纱", "有码": "遮面", "熟女": "徐娘", "萝莉": "豆蔻",
        "幼女": "玉蕊", "少女": "碧玉", "学生": "书生", "人妻": "罗敷",
        "少妇": "艳妇", "御姐": "玉人", "护士": "药女", "教师": "先生",
        "医生": "郎中", "警察": "捕快", "军人": "军爷", "秘书": "掌印",
        "老板": "东家", "丈夫": "夫君", "妻子": "拙荆", "情人": "相好",
        "小三": "外遇", "二奶": "外室", "出轨": "翻墙", "偷情": "私会",
        "通奸": "私通", "嫖娼": "寻花", "卖淫": "卖身", "妓女": "花娘",
        "性骚扰": "轻薄", "猥亵": "猥亵", "露阴": "曝玉", "咸猪手": "禄山爪",
        "丝袜": "丝履", "网袜": "网履", "内衣": "亵衣", "内裤": "亵裤",
        "情趣": "风月", "春药": "催情", "巨乳": "丰盈", "爆乳": "丰盈",
        "胸": "酥胸", "乳": "玉兔", "美乳": "玉兔", "臀": "玉臀",
        "屁股": "玉臀", "脚": "莲步", "玉足": "莲步", "腿": "玉腿",
        "裸体": "玉体", "全裸": "玉体", "半裸": "半褪", "走光": "泄春",
        "露点": "泄玉", "自慰": "弄玉", "口交": "含朱", "口活": "含朱",
        "肛交": "后庭", "屁眼": "后庭", "肛门": "后庭", "群交": "合卺",
        "乳交": "玉兔", "足交": "莲步", "车震": "车行", "野战": "郊合",
        "精液": "元阳", "精子": "元阳", "阴道": "幽处", "阴户": "幽处",
        "阴茎": "玉茎", "阳具": "玉茎", "SM": "调教", "制服": "官衣",
        "OL": "衙内", "空姐": "行云", "继母": "继室", "姐妹": "同根",
        "同学": "同窗", "邻居": "东邻", "处女": "处子", "初夜": "破瓜",
        "暴力": "杀伐", "血腥": "殷红", "恐怖": "幽冥", "赌博": "孤注",
        "毒品": "药石", "枪支": "火器", "刀具": "利刃", "国产": "华夏",
        "日韩": "东瀛", "欧美": "西洋", "港台": "香江", "动漫": "丹青",
        "综艺": "百戏", "电视剧": "传奇", "电影": "光影", "约炮": "私会",
        "裸聊": "玉聊", "露出": "泄春", "性视界": "风月视界", "小学生": "稚子",
        "学妹": "书生"
    };

    function desensitize(text) {
        if (!text) return text;
        var result = text;
        for (var k in classicalMap) {
            if (classicalMap.hasOwnProperty(k) && result.indexOf(k) !== -1) {
                result = result.split(k).join(classicalMap[k]);
            }
        }
        return result;
    }

    function isMinor(text) {
        if (!text) return false;
        var words = ["萝莉", "幼女", "少女", "学生", "小学生", "学妹", "童",
                     "teen", "loli", "schoolgirl", "豆蔻", "玉蕊", "碧玉", "书生", "稚子"];
        var lower = text.toLowerCase();
        for (var i = 0; i < words.length; i++) {
            if (lower.indexOf(words[i]) !== -1) return true;
        }
        return false;
    }

    function decrypt(cipherB64) {
        var encrypted = CryptoJS.enc.Base64.parse(cipherB64);
        var decrypted = CryptoJS.AES.decrypt(
            {ciphertext: encrypted},
            aesKey,
            {iv: aesIv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}
        );
        var jsonStr = decrypted.toString(CryptoJS.enc.Utf8);
        return JSON.parse(jsonStr);
    }

    async function fetchApi(path, params) {
        var url = base + path;
        if (params) {
            var qs = Object.keys(params).map(function (k) {
                return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
            }).join("&");
            if (qs) url += "?" + qs;
        }
        var resp = await req(url, {
            method: "get",
            headers: {
                "User-Agent": UA,
                "Accept": "application/json, text/plain, */*",
                "Referer": host + "/"
            }
        });
        var json = typeof resp === "string" ? JSON.parse(resp) : resp;
        if (json && json.cipher) {
            var d = decrypt(json.cipher);
            return d.data !== undefined ? d.data : d;
        }
        if (json && json.code !== undefined && json.data !== undefined) {
            if (json.code !== 0) throw new Error("API error " + json.code + ": " + json.msg);
            return json.data;
        }
        return json;
    }

    function vodFromItem(item) {
        var title = desensitize(item.title || "");
        if (isMinor(title)) return null;
        var cat = desensitize(item.category || "");
        if (isMinor(cat)) return null;
        return {
            vod_id: String(item.id || ""),
            vod_name: title,
            vod_pic: item.cover_url || "",
            vod_remarks: cat,
            vod_year: "",
            vod_area: "",
            vod_actor: "",
            vod_director: "",
            vod_content: ""
        };
    }

    return {
        meta: {
            key: "941ys",
            name: "941影视",
            type: 3,
            api: "",
            check: ""
        },

        async init(extend) {
            this.extend = extend || {};
        },

        async home() {
            var catsData = await fetchApi("/categories", {limit: 100});
            var classList = [];
            var filters = {};
            var list = catsData.list || [];
            for (var i = 0; i < list.length; i++) {
                var c = list[i];
                if (c.module !== "video") continue;
                var cid = String(c.id || "");
                if (minorIds[cid]) continue;
                var cname = desensitize(c.name || "");
                if (isMinor(cname)) continue;
                classList.push({type_id: cid, type_name: cname});
                filters[cid] = [{
                    key: "sort",
                    name: "排序",
                    init: "",
                    value: [
                        {n: "最新", v: "new"},
                        {n: "最热", v: "hot"}
                    ]
                }];
            }
            var recData = await fetchApi("/videos", {page: 1, limit: 20});
            var vodList = [];
            var recList = recData.list || [];
            for (var j = 0; j < recList.length; j++) {
                var v = vodFromItem(recList[j]);
                if (v) vodList.push(v);
            }
            return {class: classList, filters: filters, list: vodList};
        },

        async homeVod() {
            var data = await fetchApi("/videos", {page: 1, limit: 20});
            var vodList = [];
            var list = data.list || [];
            for (var i = 0; i < list.length; i++) {
                var v = vodFromItem(list[i]);
                if (v) vodList.push(v);
            }
            return {
                page: 1,
                pagecount: data.pages || 1,
                limit: 20,
                total: data.total || 0,
                list: vodList
            };
        },

        async category(tid, pg, filter, extend) {
            var params = {category_id: tid, page: pg, limit: 20};
            if (extend && extend.sort === "hot") params.sort = "hits";
            var data = await fetchApi("/videos", params);
            var vodList = [];
            var list = data.list || [];
            for (var i = 0; i < list.length; i++) {
                var v = vodFromItem(list[i]);
                if (v) vodList.push(v);
            }
            return {
                page: data.page || pg,
                pagecount: data.pages || 1,
                limit: 20,
                total: data.total || 0,
                list: vodList
            };
        },

        async detail(ids) {
            if (!Array.isArray(ids)) ids = [ids];
            var results = [];
            for (var i = 0; i < ids.length; i++) {
                var vid = String(ids[i]);
                try {
                    var data = await fetchApi("/movie", {id: vid});
                } catch (e) {
                    continue;
                }
                var info = data.info || {};
                var title = desensitize(info.title || "");
                if (isMinor(title)) continue;
                var cat = desensitize(info.category || "");
                var playUrl = info.play_url || "";
                var playFrom = info.play_from || "m3u8";
                if (!playUrl) continue;
                results.push({
                    vod_id: String(info.id || ""),
                    vod_name: title,
                    vod_pic: info.cover_url || "",
                    vod_remarks: cat,
                    vod_year: "",
                    vod_area: "",
                    vod_actor: "",
                    vod_director: "",
                    vod_content: title,
                    vod_play_from: playFrom,
                    vod_play_url: "正片$" + playUrl
                });
            }
            return {list: results};
        },

        async play(flag, id, vipFlags) {
            return {
                parse: 0,
                jx: 0,
                url: id,
                header: {
                    "User-Agent": UA,
                    "Referer": host + "/"
                },
                format: "application/x-mpegURL"
            };
        },

        async search(kw, quick) {
            var data = await fetchApi("/videos", {kw: kw, page: 1, limit: 20});
            var vodList = [];
            var list = data.list || [];
            for (var i = 0; i < list.length; i++) {
                var v = vodFromItem(list[i]);
                if (v) vodList.push(v);
            }
            return {
                page: 1,
                pagecount: data.pages || 1,
                limit: 20,
                total: data.total || 0,
                list: vodList
            };
        }
    };
};
