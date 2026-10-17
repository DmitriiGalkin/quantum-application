import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const directory = '.cache/quantum-update';
const publicUrl = 'https://storage.yandexcloud.net/quantum-education/';
const ideas = [
  { id:'craft-square-pine-stool-v1',kind:'stool',name:'Табуретка из дерева',description:'Деревянная табуретка с квадратным сиденьем, четырьмя прямыми ножками, царгами и нижними перекладинами. По фотографиям образца участники знакомятся с устройством каркасной мебели, делают эскиз и разметку, обрабатывают заготовки, собирают и шлифуют изделие под руководством преподавателя. Размеры, допустимая нагрузка и соединения уточняются с мастером; по фотографиям они не установлены. Обложка создана ИИ по образцу, оригинальные фотографии доступны в галерее.' },
  { id:'craft-portable-tiered-shelf-v1',kind:'shelf',name:'Переносная многоярусная полочка',description:'Переносная деревянная полочка с четырьмя открытыми лотками с бортиками. Лотки закреплены между вертикальными стойками, соединёнными сверху перекладиной для переноски. У образца коричневая отделка с видимой текстурой дерева. Учебные этапы: эскиз и разметка деталей, подготовка заготовок взрослым, обработка поверхностей, сборка лотков и стоек, шлифовка и отделка под руководством преподавателя. Размеры, нагрузку и соединения определяет мастер. Обложка создана ИИ по образцу; галерея содержит исходные фотографии.' },
];

async function upload() {
  const client = new S3Client({ region:process.env.S3_REGION || 'ru-central1',endpoint:process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net',credentials:{ accessKeyId:process.env.S3_ACCESS_KEY_ID,secretAccessKey:process.env.S3_SECRET_ACCESS_KEY } });
  const files = (await readdir(directory)).filter(name => /^(stool-|shelf-|school-1[PM3])/.test(name) && /\.(jpg|png)$/.test(name));
  files.push('school-logo.png');
  const assets = [];
  for (const name of files) {
    const bytes = await readFile(`${directory}/${name}`);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const key = `content-update-2026-10/${sha256}.${name.endsWith('.png') ? 'png' : 'jpg'}`;
    const url = publicUrl + key;
    const existing = await fetch(url,{ method:'HEAD',signal:AbortSignal.timeout(15000) });
    if (existing.status === 404) await client.send(new PutObjectCommand({ Bucket:'quantum-education',Key:key,Body:bytes,ContentType:name.endsWith('.png') ? 'image/png' : 'image/jpeg',CacheControl:'max-age=31536000' }));
    else if (!existing.ok) throw new Error(`S3 read failed ${existing.status}`);
    const check = await fetch(url,{ signal:AbortSignal.timeout(15000) });
    if (!check.ok || !Buffer.from(await check.arrayBuffer()).equals(bytes)) throw new Error('S3 readback mismatch');
    assets.push({ name,url,sha256 });
    console.log(`Verified asset ${name}`);
  }
  await writeFile('docs/quantum-update-assets.json',JSON.stringify(assets,null,2)+'\n');
  for (const idea of ideas) {
    const originals = assets.filter(a => a.name.startsWith(idea.kind+'-') && a.name.endsWith('.jpg'));
    const cover = assets.find(a => a.name === `${idea.kind}-cover.png`);
    if (!cover || originals.length !== (idea.kind === 'stool' ? 6 : 8)) throw new Error('Incomplete original photo set');
    idea.photos = [{ id:`${idea.id}-cover`,fileName:`${idea.kind}-cover.png`,url:cover.url,isCover:true,origin:'generated',generatedBy:'imagegen',sourcePhotoIds:originals.map(a => `${idea.id}-${a.name.slice(idea.kind.length+1,-4)}`),promptFile:`docs/image-prompts/catalog/${idea.id}.md` },
      ...originals.map(a => ({ id:`${idea.id}-${a.name.slice(idea.kind.length+1,-4)}`,fileName:a.name,url:a.url,isCover:false,driveFileId:a.name.slice(idea.kind.length+1,-4),sha256:a.sha256 }))];
  }
  const catalog = JSON.parse(await readFile('toy-catalog.json','utf8'));
  for (const idea of ideas) if (!catalog.items.some(i => i.id === idea.id)) catalog.items.push({ id:idea.id,name:idea.name,description:idea.description,photos:idea.photos });
  await writeFile('toy-catalog.json',JSON.stringify(catalog,null,2)+'\n');
}

async function run(apply) {
  const assets = JSON.parse(await readFile('docs/quantum-update-assets.json','utf8'));
  const catalog = JSON.parse(await readFile('toy-catalog.json','utf8'));
  const conn = await mysql.createConnection({ host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_DATABASE,port:Number(process.env.DB_PORT || 3306),timezone:'+03:00',connectTimeout:15000 });
  try {
    await conn.query("SET time_zone='+03:00'");
    const [lock] = await conn.query("SELECT GET_LOCK('quantum:demo-seed',10) acquired");
    if (Number(lock[0].acquired) !== 1) throw new Error('Maintenance lock unavailable');
    await conn.beginTransaction();
    const backup = {};
    for (const table of ['idea','ideaPhoto','place','placeLocation','placeLocationPhoto','placePassport','placeSchedule','meet','placeRental','message2']) backup[table] = (await conn.query(`SELECT * FROM ${table} FOR UPDATE`))[0];
    const teacher = (await conn.query("SELECT id,title FROM passport WHERE id=42"))[0][0];
    if (teacher?.title !== 'Дмитрий А.') throw new Error('Unexpected Dmitry identity');
    if (!(await conn.query('SELECT passportId FROM conversationPassport WHERE conversationId=16 AND passportId=86'))[0].length) throw new Error('Vera not a conversation participant');
    const addIdeas = ideas.filter(idea => !backup.idea.some(row => row.catalogId === idea.id));
    const school = backup.place.filter(p => p.title === 'Школа Рождество');
    if (school.length > 1) throw new Error('Ambiguous school');
    const reply = 'Здравствуйте, Дмитрий! Спасибо, самочувствие уже лучше. Сегодня танцы по расписанию. Буду рада видеть вас на занятии!';
    const addReply = !backup.message2.some(m => m.conversationId === 16 && m.senderPassportId === 86 && m.text === reply);
    const active = backup.meet.filter(m => !m.deletedAt && m.status !== 'cancelled');
    const start = m => new Date(m.startedAt).getTime();
    const end = m => start(m)+Number(m.duration ?? 60)*60000;
    const overlaps = (a,b) => start(a)<end(b) && end(a)>start(b);
    const canApprove = [], conflicts = [];
    for (const meet of active.filter(m => m.placeId === 597 && m.status === 'pending')) {
      const other = active.find(m => m.id !== meet.id && (m.passportId === meet.passportId || (meet.locationId !== null && m.locationId === meet.locationId)) && overlaps(meet,m));
      const rental = backup.placeRental.find(r => r.status === 'confirmed' && r.locationId === meet.locationId && start(meet)<new Date(r.endedAt).getTime() && end(meet)>start(r));
      if (other || rental) conflicts.push({ meetId:meet.id,otherMeetId:other?.id,rentalId:rental?.id }); else canApprove.push(meet.id);
    }
    const pastRentals = backup.placeRental.filter(r => r.placeId === 597 && r.status === 'pending' && start(r)<=Date.now()).map(r=>r.id);
    const futureRentals = backup.placeRental.filter(r => r.placeId === 597 && r.status === 'pending' && !r.comment?.startsWith('[ТЕСТ quantum-2026-10]') && start(r)>Date.now());
    if (futureRentals.length) throw new Error('Review future rental confirmations separately');
    const testCount = backup.placeRental.filter(r => r.comment?.startsWith('[ТЕСТ quantum-2026-10]')).length;
    const report = { apply,addIdeas:addIdeas.map(i => i.name),createSchool:!school.length,addReply,confirmMeetIds:canApprove,conflicts,pastRentalIds:pastRentals,addTestRentals:10-testCount };
    console.log(JSON.stringify(report,null,2));
    if (!apply) { await conn.rollback(); return; }
    const runDir = `${directory}/runs/${new Date().toISOString().replaceAll(':','-')}`;
    await mkdir(runDir,{recursive:true}); await writeFile(`${runDir}/before.json`,JSON.stringify(backup));
    for (const idea of addIdeas) {
      const item = catalog.items.find(i => i.id === idea.id);
      if (!item?.photos?.length) throw new Error('Catalog photos missing');
      const cover = item.photos.find(p => p.isCover);
      const [result] = await conn.execute('INSERT INTO idea (title,description,userId,passportId,catalogId,image,catalogMetadata) VALUES (?,?,NULL,NULL,?,?,?)',[idea.name,idea.description,idea.id,cover.url,JSON.stringify({ source:'Google Drive',sourceType:'user-photos' })]);
      for (const [position,photo] of item.photos.entries()) await conn.execute('INSERT INTO ideaPhoto (id,ideaId,position,photoData) VALUES (?,?,?,?)',[photo.id,result.insertId,position,JSON.stringify(photo)]);
    }
    let placeId = school[0]?.id;
    if (!placeId) {
      const [result] = await conn.execute('INSERT INTO place (title,description,address,latitude,longitude,phone,image) VALUES (?,?,?,?,?,?,?)',[
        'Школа Рождество','Православная школа полного дня в селе Рождествено. Пн–пт 08:00–18:00. Контакт: rozhd-school@mail.ru. Сайт: школарождество.рф.',
        'Московская область, г. Истра, с. Рождествено, ул. Пионерская, д. 138А','55.854079','37.048101','+7 (495) 994-76-82',assets.find(a=>a.name==='school-logo.png').url]);
      placeId = result.insertId;
      await conn.execute("INSERT INTO placePassport (placeId,passportId,role) VALUES (?,42,'admin')",[placeId]);
      for (let day=1;day<=7;day++) await conn.execute('INSERT INTO placeSchedule (placeId,weekday,enabled,startTime,endTime) VALUES (?,?,?,?,?)',[placeId,day,day<=5,'08:00:00','18:00:00']);
      const [room] = await conn.execute('INSERT INTO placeLocation (placeId,title) VALUES (?,?)',[placeId,'Столярная мастерская']);
      for (const [position,photo] of assets.filter(a => /^school-1[PM3]/.test(a.name)).entries()) await conn.execute('INSERT INTO placeLocationPhoto (locationId,url,position) VALUES (?,?,?)',[room.insertId,photo.url,position]);
    }
    if (addReply) await conn.execute('INSERT INTO message2 (conversationId,senderPassportId,text) VALUES (16,86,?)',[reply]);
    for (const id of canApprove) await conn.execute("UPDATE meet SET status='published',bookingState='confirmed' WHERE id=? AND status='pending'",[id]);
    const slots = [];
    for (let offset=1;offset<60 && slots.length<10-testCount;offset++) {
      const day = new Date(Date.now()+offset*86400000+3*3600000).toISOString().slice(0,10);
      const weekday = new Date(`${day}T12:00:00+03:00`).getUTCDay();
      if (weekday===0 || weekday===6) continue;
      for (const hour of [8,9,10,11,12,13,14,15,16]) {
        const from = new Date(`${day}T${String(hour).padStart(2,'0')}:00:00+03:00`);
        const until = new Date(from.getTime()+3600000);
        const meetBusy = active.some(m => m.locationId === 6 && start(m)<until.getTime() && end(m)>from.getTime());
        const rentalBusy = backup.placeRental.some(r => r.locationId === 6 && ['pending','confirmed'].includes(r.status) && start(r)<until.getTime() && new Date(r.endedAt).getTime()>from.getTime());
        if (!meetBusy && !rentalBusy) slots.push({from,until});
        if(slots.length>=10-testCount)break;
      }
    }
    if (slots.length!==10-testCount) throw new Error('Not enough future slots');
    for (const [index,slot] of slots.entries()) await conn.execute('INSERT INTO placeRental (placeId,locationId,passportId,startedAt,endedAt,participants,comment,hourlyRate,estimatedTotal) VALUES (597,6,?,?,?,?,?,NULL,NULL)',[
      index+testCount<2 ? 42 : 44+(index+testCount-2)%6,slot.from,slot.until,8,`[ТЕСТ quantum-2026-10] Заявка ${index+testCount+1}. Демонстрация аренды актового зала.`]);
    await conn.commit();
    const after = { schoolId:placeId,ideas:(await conn.query('SELECT id,title FROM idea WHERE catalogId IN (?)',[ideas.map(i=>i.id)]))[0],testRentals:(await conn.query("SELECT id,passportId,status,startedAt FROM placeRental WHERE comment LIKE '[ТЕСТ quantum-2026-10]%'"))[0] };
    await writeFile(`${runDir}/after.json`,JSON.stringify(after,null,2));
    console.log(JSON.stringify({committed:true,...after},null,2));
  } catch(error) { await conn.rollback().catch(()=>undefined); throw error; }
  finally { await conn.end(); }
}
try { if (process.argv.includes('--upload')) await upload(); else await run(process.argv.includes('--apply')); }
catch(error) { console.error(`Content update failed: ${error.code || error.message}. Read state before retrying writes.`); process.exitCode=1; }
