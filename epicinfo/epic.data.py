import json

data = {}

# 用 GraphQL 获取的内容
with open('data1.json', 'r', encoding='utf-8') as f:
    data1 = json.load(f)

# 用 https://store-content.ak.epicgames.com/api/content/productmapping 获取的内容
with open('data2.json', 'r', encoding='utf-8') as f:
    data2 = json.load(f)

for ns in data1:
    slug = data1[ns]
    if len(slug) == 32:
        continue
    if 'audience' in slug:
        if ns in data2:
            slug = data2[ns]
        else:
            continue
    data[ns] = slug

for ns in data2:
    data[ns] = data2[ns]

with open('data.json', 'w', encoding='utf-8') as f:
    f.write(json.dumps(data))