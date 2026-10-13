# Светлые обложки идей №88–149 и №151

Обновлены 63 существующие карточки: №88–149 включительно и №151. Новые идеи не создавались. Идея №150 сохранена без изменений и использована только как образец светлого фона.

Каждая обложка получена отдельным вызовом встроенного imagegen. Фон сделан светлее и бледнее, немногочисленные материалы и инструменты отделены от изделия свободным пространством. Конструкции сверены с прежними обложками; для настольных весов №101 использован также оригинал фотографии. Иллюстрации остаются сгенерированными изображениями предложенных учебных конструкций.

Все 63 PNG 1536×1024 опубликованы в S3; URL сохранены в каталоге и реестре. Точные промпты и результаты визуальной проверки находятся в `docs/image-prompts/catalog/`. [Полный реестр](light-covers-2026-10-13.json) содержит промпты, порядок и идентификаторы референсов, SHA-256, результаты генерации, проверки загрузки и публикации. Старые локальные пути в реестре описывают историю генерации и не используются приложением.

Загрузка выполнена через FileService, адресное обновление — через IdeaService. Названия, описания, cardData, catalogMetadata, числовые и постоянные ID сохранены; каждая карточка имеет ровно одну новую обложку. Прежние фотографии, включая старые обложки, сохранены дополнительными изображениями. Каталог toy-catalog.json синхронизирован.

Проверка БД: 96 идей до и после; число фотографий увеличилось со 112 до 175. Сравнение всех строк подтвердило отсутствие иных изменений в идеях и сохранность прежних фотографий; у фотографий обновлённых карточек изменены только позиция и флаг обложки. Остальные карточки и фотографии не изменились.

Резервные копии и подтверждения чтения сохранены в .cache/light-covers-2026-10-13/: backup-2026-10-13T08-19-01.475Z.json, backup-2026-10-13T12-14-16.864Z.json, соответствующие db-after и combined-db-verification.json. Обновление прошло двумя транзакциями: 16 и 47 карточек. После временных обрывов связи состояние повторно прочитано перед записью. Занятые имена файлов не перезаписывались; новые результаты опубликованы под отдельными версиями.

Проверены обе формы API-адреса всех 63 карточек (числовой ID и toy-ID), содержание, единственная обложка и сохранённая галерея; все 63 страницы q3-dev.ru ответили HTTP 200 с ожидаемыми названиями. Доступность PNG, MIME-тип и совпадение SHA-256 подтверждены при загрузке. npm.cmd run check завершился успешно.

Браузерная визуальная проверка не выполнена: в окружении не было доступной управляемой вкладки. Сами изображения просмотрены; локальное отображение всех 63 страниц и галерей, выбор единственной обложки и подпись о генерации проверены через SSR.

| Идея | Название | Точный промпт новой обложки |
| --- | --- | --- |
| [№88](https://q3-dev.ru/idea/88) | Медальон из поперечного спила | [toy-010-generated-cover-v2](image-prompts/catalog/toy-010-generated-cover-v2.prompt.md) |
| [№89](https://q3-dev.ru/idea/89) | Подставка для кружки из спила | [toy-011-generated-cover-v2](image-prompts/catalog/toy-011-generated-cover-v2.prompt.md) |
| [№90](https://q3-dev.ru/idea/90) | Деревянная подставка для фотографии | [toy-012-generated-cover-v2](image-prompts/catalog/toy-012-generated-cover-v2.prompt.md) |
| [№91](https://q3-dev.ru/idea/91) | Подставка для горячего из маленьких спилов | [toy-013-generated-cover-v2](image-prompts/catalog/toy-013-generated-cover-v2.prompt.md) |
| [№92](https://q3-dev.ru/idea/92) | Домик для гнома | [toy-014-generated-cover-v2](image-prompts/catalog/toy-014-generated-cover-v2.prompt.md) |
| [№93](https://q3-dev.ru/idea/93) | Кукольная мебель из спилов и веток | [toy-015-generated-cover-v2](image-prompts/catalog/toy-015-generated-cover-v2.prompt.md) |
| [№94](https://q3-dev.ru/idea/94) | Ёлочные игрушки из спилов | [toy-016-generated-cover-v2](image-prompts/catalog/toy-016-generated-cover-v2.prompt.md) |
| [№95](https://q3-dev.ru/idea/95) | Деревянный крючок для вязания | [toy-017-generated-cover-v2](image-prompts/catalog/toy-017-generated-cover-v2.prompt.md) |
| [№96](https://q3-dev.ru/idea/96) | Кораблик из коры | [toy-018-generated-cover-v2](image-prompts/catalog/toy-018-generated-cover-v2.prompt.md) |
| [№97](https://q3-dev.ru/idea/97) | Деревянный конструктор из спилов и цилиндров | [toy-019-generated-cover-v3](image-prompts/catalog/toy-019-generated-cover-v3.prompt.md) |
| [№98](https://q3-dev.ru/idea/98) | Пирамидка из спилов | [toy-020-generated-cover-v2](image-prompts/catalog/toy-020-generated-cover-v2.prompt.md) |
| [№99](https://q3-dev.ru/idea/99) | Крючок для одежды из ветки | [toy-021-generated-cover-v2](image-prompts/catalog/toy-021-generated-cover-v2.prompt.md) |
| [№100](https://q3-dev.ru/idea/100) | Подвесные весы | [toy-022-generated-cover-v2](image-prompts/catalog/toy-022-generated-cover-v2.prompt.md) |
| [№101](https://q3-dev.ru/idea/101) | Настольные весы | [toy-023-generated-cover-v2](image-prompts/catalog/toy-023-generated-cover-v2.prompt.md) |
| [№102](https://q3-dev.ru/idea/102) | Ханукальный подсвечник из дерева | [toy-024-generated-cover-v2](image-prompts/catalog/toy-024-generated-cover-v2.prompt.md) |
| [№103](https://q3-dev.ru/idea/103) | Деревянный дрейдл | [toy-025-generated-cover-v2](image-prompts/catalog/toy-025-generated-cover-v2.prompt.md) |
| [№104](https://q3-dev.ru/idea/104) | Деревянная лопата для хлеба | [toy-026-generated-cover-v3](image-prompts/catalog/toy-026-generated-cover-v3.prompt.md) |
| [№105](https://q3-dev.ru/idea/105) | Деревянные грабли | [toy-027-generated-cover-v3](image-prompts/catalog/toy-027-generated-cover-v3.prompt.md) |
| [№106](https://q3-dev.ru/idea/106) | Деревянная лопата для снега | [toy-028-generated-cover-v3](image-prompts/catalog/toy-028-generated-cover-v3.prompt.md) |
| [№107](https://q3-dev.ru/idea/107) | Деревянная киянка | [toy-029-generated-cover-v3](image-prompts/catalog/toy-029-generated-cover-v3.prompt.md) |
| [№108](https://q3-dev.ru/idea/108) | Рамочный ткацкий станок | [toy-030-generated-cover-v3](image-prompts/catalog/toy-030-generated-cover-v3.prompt.md) |
| [№109](https://q3-dev.ru/idea/109) | Деревянная тачка | [toy-031-generated-cover-v3](image-prompts/catalog/toy-031-generated-cover-v3.prompt.md) |
| [№110](https://q3-dev.ru/idea/110) | Скворечник из брёвнышка | [toy-032-generated-cover-v3](image-prompts/catalog/toy-032-generated-cover-v3.prompt.md) |
| [№111](https://q3-dev.ru/idea/111) | Ходули с верёвками | [toy-033-generated-cover-v3](image-prompts/catalog/toy-033-generated-cover-v3.prompt.md) |
| [№112](https://q3-dev.ru/idea/112) | Подставка для карандашей и ручек | [toy-034-generated-cover-v2](image-prompts/catalog/toy-034-generated-cover-v2.prompt.md) |
| [№113](https://q3-dev.ru/idea/113) | Фанерные цифры для часов | [toy-035-generated-cover-v3](image-prompts/catalog/toy-035-generated-cover-v3.prompt.md) |
| [№114](https://q3-dev.ru/idea/114) | Ёлочные игрушки из фанеры | [toy-036-generated-cover-v2](image-prompts/catalog/toy-036-generated-cover-v2.prompt.md) |
| [№115](https://q3-dev.ru/idea/115) | Кораблик с бортами из гвоздей и джутовой верёвки | [toy-037-generated-cover-v3](image-prompts/catalog/toy-037-generated-cover-v3.prompt.md) |
| [№116](https://q3-dev.ru/idea/116) | Шум ветра из дерева | [toy-038-generated-cover-v2](image-prompts/catalog/toy-038-generated-cover-v2.prompt.md) |
| [№117](https://q3-dev.ru/idea/117) | Игра «Чижик» из дерева | [toy-039-generated-cover-v2](image-prompts/catalog/toy-039-generated-cover-v2.prompt.md) |
| [№118](https://q3-dev.ru/idea/118) | Малый деревянный кольцеброс | [toy-040-generated-cover-v2](image-prompts/catalog/toy-040-generated-cover-v2.prompt.md) |
| [№119](https://q3-dev.ru/idea/119) | Большой деревянный кольцеброс | [toy-041-generated-cover-v2](image-prompts/catalog/toy-041-generated-cover-v2.prompt.md) |
| [№120](https://q3-dev.ru/idea/120) | Деревянная кегля (пешка) | [toy-042-generated-cover-v2](image-prompts/catalog/toy-042-generated-cover-v2.prompt.md) |
| [№121](https://q3-dev.ru/idea/121) | Деревянный ксилофон | [toy-043-generated-cover-v2](image-prompts/catalog/toy-043-generated-cover-v2.prompt.md) |
| [№122](https://q3-dev.ru/idea/122) | Шум дождя | [toy-044-generated-cover-v2](image-prompts/catalog/toy-044-generated-cover-v2.prompt.md) |
| [№123](https://q3-dev.ru/idea/123) | Кораблик из расколотого брёвнышка | [toy-045-generated-cover-v2](image-prompts/catalog/toy-045-generated-cover-v2.prompt.md) |
| [№124](https://q3-dev.ru/idea/124) | Деревянные шашки | [toy-046-generated-cover-v2](image-prompts/catalog/toy-046-generated-cover-v2.prompt.md) |
| [№125](https://q3-dev.ru/idea/125) | Птичка из ветки | [toy-047-generated-cover-v2](image-prompts/catalog/toy-047-generated-cover-v2.prompt.md) |
| [№126](https://q3-dev.ru/idea/126) | Резное животное: мышка или ёжик | [toy-048-generated-cover-v2](image-prompts/catalog/toy-048-generated-cover-v2.prompt.md) |
| [№127](https://q3-dev.ru/idea/127) | Кухонная лопатка из ветки, вырезанная ножом | [toy-049-generated-cover-v3](image-prompts/catalog/toy-049-generated-cover-v3.prompt.md) |
| [№128](https://q3-dev.ru/idea/128) | Деревянное яйцо, обработанное рашпилем | [toy-050-generated-cover-v2](image-prompts/catalog/toy-050-generated-cover-v2.prompt.md) |
| [№129](https://q3-dev.ru/idea/129) | Резная фигура человека величиной в предплечье | [toy-051-generated-cover-v2](image-prompts/catalog/toy-051-generated-cover-v2.prompt.md) |
| [№130](https://q3-dev.ru/idea/130) | Деревянный воздушный винт | [toy-052-generated-cover-v2](image-prompts/catalog/toy-052-generated-cover-v2.prompt.md) |
| [№131](https://q3-dev.ru/idea/131) | Кухонная лопатка, обработанная рашпилем | [toy-053-generated-cover-v2](image-prompts/catalog/toy-053-generated-cover-v2.prompt.md) |
| [№132](https://q3-dev.ru/idea/132) | Деревянная мешалка | [toy-054-generated-cover-v2](image-prompts/catalog/toy-054-generated-cover-v2.prompt.md) |
| [№133](https://q3-dev.ru/idea/133) | Деревянный совок для зерна | [toy-055-generated-cover-v2](image-prompts/catalog/toy-055-generated-cover-v2.prompt.md) |
| [№134](https://q3-dev.ru/idea/134) | Резная деревянная ложка | [toy-056-generated-cover-v2](image-prompts/catalog/toy-056-generated-cover-v2.prompt.md) |
| [№135](https://q3-dev.ru/idea/135) | Скалка или толокушка из дерева | [toy-057-generated-cover-v2](image-prompts/catalog/toy-057-generated-cover-v2.prompt.md) |
| [№136](https://q3-dev.ru/idea/136) | Неглубокая деревянная чаша для хлеба | [toy-058-generated-cover-v2](image-prompts/catalog/toy-058-generated-cover-v2.prompt.md) |
| [№137](https://q3-dev.ru/idea/137) | Деревянная головоломка Т или М | [toy-059-generated-cover-v3](image-prompts/catalog/toy-059-generated-cover-v3.prompt.md) |
| [№138](https://q3-dev.ru/idea/138) | Деревянная подставка для книги | [toy-060-generated-cover-v2](image-prompts/catalog/toy-060-generated-cover-v2.prompt.md) |
| [№139](https://q3-dev.ru/idea/139) | Глубокая деревянная чаша | [toy-061-generated-cover-v2](image-prompts/catalog/toy-061-generated-cover-v2.prompt.md) |
| [№140](https://q3-dev.ru/idea/140) | Деревянный письменный прибор | [toy-062-generated-cover-v3](image-prompts/catalog/toy-062-generated-cover-v3.prompt.md) |
| [№141](https://q3-dev.ru/idea/141) | Подставка для яйца, скорлупы и ложечки | [toy-063-generated-cover-v3](image-prompts/catalog/toy-063-generated-cover-v3.prompt.md) |
| [№142](https://q3-dev.ru/idea/142) | Подставка под самодельный глобус | [toy-064-generated-cover-v3](image-prompts/catalog/toy-064-generated-cover-v3.prompt.md) |
| [№143](https://q3-dev.ru/idea/143) | Деревянная солонка с крышкой | [toy-065-generated-cover-v3](image-prompts/catalog/toy-065-generated-cover-v3.prompt.md) |
| [№144](https://q3-dev.ru/idea/144) | Вертикальный деревянный подсвечник | [toy-066-generated-cover-v3](image-prompts/catalog/toy-066-generated-cover-v3.prompt.md) |
| [№145](https://q3-dev.ru/idea/145) | Деревянные таблички для классов | [toy-067-generated-cover-v3](image-prompts/catalog/toy-067-generated-cover-v3.prompt.md) |
| [№146](https://q3-dev.ru/idea/146) | Цельная резная рамка для фото | [toy-068-generated-cover-v3](image-prompts/catalog/toy-068-generated-cover-v3.prompt.md) |
| [№147](https://q3-dev.ru/idea/147) | Деревянная полка с шиповыми и угловыми соединениями | [toy-069-generated-cover-v3](image-prompts/catalog/toy-069-generated-cover-v3.prompt.md) |
| [№148](https://q3-dev.ru/idea/148) | Деревянная шкатулка для украшений | [toy-070-generated-cover-v3](image-prompts/catalog/toy-070-generated-cover-v3.prompt.md) |
| [№149](https://q3-dev.ru/idea/149) | Деревянный ящик для документов А4 | [toy-071-generated-cover-v5](image-prompts/catalog/toy-071-generated-cover-v5.prompt.md) |
| [№151](https://q3-dev.ru/idea/151) | Крупная деревянная мебель: кресло, кровать или стол | [toy-073-generated-cover-v3](image-prompts/catalog/toy-073-generated-cover-v3.prompt.md) |
