# Изображения демонстрационных мастерских

22 изображения созданы встроенным инструментом `image_gen` по навыку imagegen: 12 обложек, 6 портретов взрослых и 4 интерьера. Люди и центры вымышленные. Генерация не использовала фотографии реальных людей. JPEG подготовлены шириной не более 1200 px, качество 85; общий размер около 4 МБ. Исходные PNG сохранены локально в `.cache/demo/originals/`.

`images.json` содержит публичные S3-ссылки. Ключи включают SHA-256 содержимого, поэтому повторная загрузка сохраняет URL, а обновлённое изображение получает новый URL без проблем с годовым кешем.

## Набор промптов

Общий промпт обложек: “Create one premium editorial product photograph for an educational craft website, landscape 3:2. Subject: [subject]. Warm oak workbench, subtle relevant craft supplies, soft natural window light, cohesive cream sage blue palette, professional realistic photography, clean generous centred framing. No people, no text, no logos. Fictional demonstration craft project.”

Предметы: деревянный парусник с льняным парусом и синим корпусом; скворечник с зелёной крышей; подвижный деревянный робот; деревянный лабиринт для шарика; бумажный театр теней; кулачковый механизм с птицей; маленькая мельница; деревянный город; небольшой ткацкий станок; мобиль с луной и звёздами; штампы с открытками; бумажный фонарь с LED. Парусник использовал тот же визуальный стиль с отдельным описанием деталей корпуса и паруса.

Общий промпт портретов: “One premium realistic editorial portrait photograph for a fictional educational platform demo, square crop. Subject: [subject]. Warm light filled craft studio with blurred wooden shelves behind, calm confident approachable expression, head and upper torso, soft natural light, cohesive cream sage blue palette. One adult only, no children, no text, no logos, do not resemble any celebrity.”

Персонажи: женщина около 35 лет с короткими тёмными волосами и зелёной рубашкой; мужчина около 40 лет с короткой бородой и синим фартуком; женщина около 30 лет с рыжими собранными волосами; мужчина около 32 лет с чёрными волосами и синей рубашкой; женщина около 45 лет со светлыми волосами и терракотовой рубашкой; мужчина около 50 лет с седыми волосами, круглыми очками и зелёным фартуком.

Общий промпт интерьеров: “One premium realistic architectural editorial photograph for a fictional educational craft centre demo, landscape 3:2. [subject]. Inviting professional interior, cohesive cream sage blue palette, realistic modest Moscow urban workshop scale. No people, no children, no text, no logos.”

Интерьеры: светлая столярная студия с дубовыми столами; студия бумажных мастерских и печати; лаборатория механических моделей; текстильная и декоративная студия со станками и пряжей.

## Расширение

В `extension/` добавлены десять отдельных обложек, созданных встроенным `image_gen`: воздушный змей, калейдоскоп, мост из палочек, картонный планетарий с LED, мини-теплица, бумажный аквариум, кормушка, мозаичное панно, магнитная рыбалка и настольная игра. JPEG размером 1200 × 800. Это вымышленные демонстрационные изделия; исходные PNG сохранены в локальном каталоге генерации Codex, список путей — в игнорируемой `.cache/demo/extension-sources.json`.

Общий промпт: “Product mockup Quantum children's educational workshop cover: [subject]. Warm realistic wooden table in a cosy craft workshop, soft natural daylight, muted beige background, colourful handcrafted object, cohesive existing catalog style. Landscape 3:2. No people, no text, no logos.” Каждый предмет генерировался отдельным вызовом, без композиции из нескольких картинок.
