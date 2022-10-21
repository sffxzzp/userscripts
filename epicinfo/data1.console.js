// 在 Epic 商店中，使用 Console 执行

var page = await fetch('https://store.epicgames.com/graphql?operationName=searchStoreQuery&variables={"allowCountries":"CN","category":"games/edition/base|bundles/games","comingSoon":false,"count":1,"country":"CN","keywords":"","locale":"zh-CN","sortBy":"releaseDate","sortDir":"DESC","start":0,"tag":"","withPrice":false}&extensions={"persistedQuery":{"version":1,"sha256Hash":"13a2b6787f1a20d05c75c54c78b1b8ac7c8bf4efc394edf7a5998fdf35d1adb0"}}').then(res => res.json());
var max = Math.ceil(page.data.Catalog.searchStore.paging.total / 100);
for (let i = 0; i < max; i++) {
    var url = `https://store.epicgames.com/graphql?operationName=searchStoreQuery&variables={"allowCountries":"CN","category":"games/edition/base|bundles/games","comingSoon":false,"count":100,"country":"CN","keywords":"","locale":"zh-CN","sortBy":"releaseDate","sortDir":"DESC","start":${i*100},"tag":"","withPrice":false}&extensions={"persistedQuery":{"version":1,"sha256Hash":"13a2b6787f1a20d05c75c54c78b1b8ac7c8bf4efc394edf7a5998fdf35d1adb0"}}`;
    var data = await fetch(url).then(res => res.json());
    for (let item of data.data.Catalog.searchStore.elements) {
        if (item.namespace.length < 32) { continue; }
        console.log(item.namespace, item.urlSlug);
    }
}