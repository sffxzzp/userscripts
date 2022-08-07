// ==UserScript==
// @name         Yuplay Helper
// @namespace    https://coding.net/u/sffxzzp
// @version      0.08
// @description  Add ACRTAG info on yuplay.ru product pages which has SUB_ID, and translate some text into zh_CN.
// @author       sffxzzp
// @match        *://yuplay.ru/product/*
// @match        *://yuplay.ru/*
// @icon         https://yuplay.ru/img/img/favicon.ico
// @grant        GM_xmlhttpRequest
// @connect      steamdb.info
// @updateURL    https://sffxzzp.coding.net/p/userscripts/d/userscripts/git/raw/master/yuplayhelper.user.js
// ==/UserScript==

(function() {
    function resInfo(subid) {
        var attention = document.createElement("p");
        attention.setAttribute("id", "attention");
        attention.setAttribute("style", "color: black;")
        attention.innerHTML = "Checking ACRTAG Info...";
        document.querySelector(".list-character").children[0].appendChild(attention);
        GM_xmlhttpRequest({
            url: "https://steamdb.info/sub/"+subid+"/",
            method: "get",
            onload: function (res) {
                addInfo(subid, res.response);
            },
            onerror: resError,
            ontimeout: resError
        });
    }
    function resError(cont) {
        cont = cont==undefined?"SteamDB Connect Error!":cont;
        var attention = document.getElementById("attention");
        attention.setAttribute("style", "color: red;");
        attention.innerHTML = cont;
    }
    function addInfo(subid, res) {
        var cfCheck = /(cf-browser-verification|complete_sec_check)/.exec(res);
        if (cfCheck) {
            resError("Browser verification detected. Please open SteamDB manually for once...");
            return false;
        }
        var attention = document.getElementById("attention");
        attention.parentNode.removeChild(attention);
        var gameinfo = document.querySelector(".list-character").children[0];
        res = res.split("id=\"info\"")[1].split("id=\"app\"")[0];
        var prCountries = /PurchaseRestrictedCountries<\/td>[\s\S].*country-list">(.*?)<\/td>/ig.exec(res);
        var orCountries = /onlyallowrunincountries<\/td>[\s\S].*country-list">(.*?)<\/td>/ig.exec(res);
        if (prCountries) {
            prCountries = prCountries[1].split(" ");
            var pr = document.createElement("p");
            pr.setAttribute("style", "color: orange;");
            pr.innerHTML = "Purchase Only: ";
            for (var i=0;i<prCountries.length;i++) {
                var prs = document.createElement("span");
                prs.innerHTML = prCountries[i]+" ";
                pr.appendChild(prs);
            }
            gameinfo.appendChild(pr);
        }
        if (orCountries) {
            console.log("Run Only: "+orCountries[1]);
            orCountries = orCountries[1].split(" ");
            var or = document.createElement("p");
            or.setAttribute("style", "color: red;");
            or.innerHTML = "Run Only: ";
            for (var j=0;j<orCountries.length;j++) {
                var ors = document.createElement("span");
                ors.innerHTML = orCountries[j]+" ";
                or.appendChild(ors);
            }
            gameinfo.appendChild(or);
        }
    };
    function main() {
        var gameinfo = document.querySelector(".list-character").children[0].children;
        for (var i=gameinfo.length-1;i>-1;i--) {
            if (gameinfo[i].innerText.indexOf("SUB_ID")>0) {
                var subid = gameinfo[i].children[0];
                subid.innerHTML = "<a href=\"https://steamdb.info/sub/"+subid.innerText+"/\" target=\"_blank\">"+subid.innerText+"</a>";
                resInfo(subid.innerText);
                break;
            }
        }
    }
    function CN() {
        var data = {
            'Как это работает?': '帮助',
            'Корзина': '购物车',
            'Скачиваемые игры': '可下载的游戏',
            '99 руб и ниже': '99卢布以下',
            'Свежак': '最近更新',
            'Хотелки': '收藏',
            'Скоро': '即将解锁',
            'Описание': '描述',
            'Видео ': '视频 ',
            'Скриншоты': '截图',
            'Купить': '购买',
            'Цифровая доставка': '激活码',
            'Eсть в наличии': '可用',
            'Жанры:': '类型：',
            'Платформа:': '平台：',
            'Активация:': '激活：',
            'Дата выхода:': '发布日期：',
            'Разработчики:': '开发商：',
            'Издатели:': '发行商：',
            'Языки:': '语言：',
            'Системные требования': '系统需求',
            'Минимальные': '最低配置',
            'Рекомендуемые': '推荐配置',
            'Рекомендованные': '推荐配置',
            'Операционная система:': '操作系统：',
            'Процессор:': '处理器：',
            'ГГц': 'GHz',
            'или аналог': '或同等',
            'Оперативная память:': '内存：',
            'ГБ': 'GB',
            'свободного места на жёстком диске': '磁盘可用空间',
            'Видеокарта:': '显卡：',
            'Видеокарта': '显卡：',
            'Звуковая карта:': '声卡：',
            'Звуковая карта, ': '声卡：',
            'совместимая': '需兼容',
            'Что я покупаю': '我买的是什么',
            'Другие игры серии': '系列中的其他',
            'Жёсткий диск:': '硬盘：',
            'Место на диске:': '磁盘空间：',
            'свободного пространства': '可用空间',
            'Поддержка контроллера:': '控制器：',
            '3-хкнопочная мышь, клавиатура и колонки': '3键鼠标，键盘和扬声器',
            'Специальные требования для сетевой игры: ': '网络需求：',
            'Интернет или локальная сеть': '互联网或局域网',
            'или': '或',
            'видеопамяти': '显存',
            'более новая': '更高',
            'более мощные с': '其他大于',
            'Загружаемый контент': 'DLC',
            'Распродажа': '促销',
            'pуб': '卢布',
            'руб': '卢布',
            'Главная': '首页',
            'Сортировать по': '排序',
            'дате выхода': '发布日期',
            'названию': '游戏名称',
            'дешевле': '价格升序',
            'дороже': '价格降序',
            'Цена': '价格',
            'Тип': '类型',
            'Игра': '游戏',
            'Расширенная версия': '合集包',
            'Season Pass': '季票',
            'Дополнение': '功能扩展',
            'Таймкарта': '点券',
            'Карта оплаты': '充值卡',
            'Бандл': '大包',
            'Антивирус': '杀毒软件',
            'Soundtrack': '原声音乐',
            'Жанры': '种类',
            'MMOG и Тайм-коды': 'MMOG和点券',
            'Action и Шутеры': '动作射击',
            'RPG': '角色扮演',
            'Гонки': '竞速',
            'Стратегии': '战略',
            'Приключения': '冒险',
            'Спортивные': '体育',
            'Драки': '格斗',
            'Симуляторы': '模拟',
            'Казуальные': '休闲',
            'Инди': '独立',
            'Семейные': '家庭',
            'Пробные версии': '体验版',
            'Программы': '软件',
            'Активация': '激活',
            'Показать': '搜索',
            'Отборный свежак': '最近添加',
            'Пополнение каталога': '补货',
            'Открыт предзаказ': '开始预购',
            'В корзине нет товаров': '购物车是空的。',
            'Войти по E-mail': '通过电子邮件登录',
            'Войти как пользователь соцсети': '通过社交网站登录',
            'Зарегистрироваться': '注册',
            'Пароль': '密码',
            'Забыли пароль': '忘记密码',
            'Восстановление пароля': '密码恢复',
            'Для восстановления утерянного пароля введите E-mail, указанный при регистрации': '要恢复丢失的密码，请输入注册时指定的电子邮件',
            'Отправить': '提交',
            'Управление подписками': '管理订阅',
            'Личный кабинет': '帐号操作',
            'Подписка на новости магазина поможет вам своевременно получать информацию о последних новинках, а также приятных скидках и интересных конкурсах. Всегда будьте в курсе последних событий!': '订阅商店新闻可以让您获得最新的信息，令人愉快的折扣以及有趣的比赛。 始终与最新的信息保持同步！',
            'Подписка на новости': '订阅新闻',
            'Чтобы подписаться на новости магазина введите ваш E-mail:': '要订阅商店新闻，请输入您的电子邮件地址：',
            'Подписаться': '订阅',
            'Для отказа от рассылки укажите ваш E-mail в форме ниже': '要取消订阅，请在下面的表格中输入您的电子邮件。',
            'Отписаться': '取消订阅',
            'Поддержка': '支持',
            'Задать вопрос': '提交问题',
            'Вы можете задать ваш вопрос используя форму ниже': '您可以使用下面的表格提交您的问题',
            'Текст сообщения': '内容',
            'Профиль': '个人资料',
            'Добро пожаловать': '欢迎',
            'Ваш баланс:': '您的余额：',
            'Редактировать профиль': '编辑档案',
            'Изменить': '修改',
            'Ваш действующий пароль': '当前密码',
            'Новый пароль': '新密码',
            'Повторите пароль': '重新输入新密码',
            'Пополнить баланс': '账户充值',
            'Пополнение баланса': '账户充值',
            'Сумма': '总计',
            'Пополнить счет': '充值',
            'Или введите': '或输入',
            'подарочный сертификат': '礼品卡',
            'Активировать': '激活',
            'Мои покупки': '我的购买',
            'Недавние покупки': '最近的',
            'Все покупки': '全部',
            'Пополнения счета': '补货',
            'Отменен': '已取消',
            'Ничего не найдено': '没有内容',
            'Заказ': '账单ID',
            'Товары': '产品',
            'Статус': '状态',
            'шт.': '个',
            'Успешен': '完成',
            'подробнее': '更多信息',
            'Электронные кошельки': '电子钱包',
            'Электронные кошелки': '电子钱包',
            'Зачем нужна привязка?': '为什么绑定？',
            'Привязав электронный кошелек Яндекс.Денег к Вашему аккаунту в магазине, оплачивать заказы станет гораздо удобнее! Вы сможете:': '通过将电子钱包Yandex.Money绑定到商店中的帐户，支付订单将更方便！ 您将能够：',
            'Оплачивать заказы из кошелька Яндекс.Денег в 1 клик;': '用Yandex.Money钱包一键支付订单;',
            'Всегда видеть баланс своего кошелька.': '可以看到钱包余额。',
            'Яндекс.Деньги': 'Yandex.Money',
            'Создание новой привязки': '创建新的绑定',
            'Моя партнерская программа': '我的推广计划',
            'Партнерская программа': '推广计划',
            'Зарабатывай с нами': '和我们一起赚钱',
            'Отчет по продажам': '销售报告',
            'Статистика переходов': '转换统计信息',
            'О YUPLAY': '关于 YUPLAY',
            'Баланс': '钱包',
            'Войти': '登录',
            'Выход': '登出',
            'Поиск': '搜索',
            'Название': '名称',
            'Удалить': '删除',
            'Перейти к оплате': '去付款',
            'Вы покупаете': '购买：',
            'Себе': '给自己',
            'В подарок': '作为礼物',
            'Введите код для получения скидки:': '输入代码以获得折扣：',
            'Январь': 'Jan',
            'января': 'Jan',
            'Февраль': 'Feb',
            'февраля': 'Feb',
            'Март': 'Mar',
            'марта': 'Mar',
            'Апрель': 'Apr',
            'апреля': 'Apr',
            'Май': 'May',
            'мая': 'May',
            'Июнь': 'Jun',
            'июня': 'Jun',
            'Июль': 'Jul',
            'июля': 'Jul',
            'Август': 'Aug',
            'августа': 'Aug',
            'Сентябрь': 'Sept',
            'сентября': 'Sept',
            'Октябрь': 'Oct',
            'октября': 'Oct',
            'Ноябрь': 'Nov',
            'ноября': 'Nov',
            'Декабрь': 'Dec',
            'декабря': 'Dec'
        }
        for (var rutext in data) {
            var re = new RegExp(rutext, 'g');
            document.body.innerHTML = document.body.innerHTML.replace(re, data[rutext]);
        }
        var datah = {
            'Купить': '购买',
            'и скачать': '并下载'
        }
        for (var rutexth in datah) {
            var reh = new RegExp(rutexth, 'g');
            document.title = document.title.replace(reh, datah[rutexth]);
        }
    }
    if (location.href.match(/yuplay.ru\/product\/\d*/)) {
        main();
    }
    CN();
})();