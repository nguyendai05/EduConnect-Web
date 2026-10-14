// Kiểm hợp đồng SQL/schema/docs bằng Node có sẵn; không kết nối DB hay sửa file.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const read = p => readFileSync(p, 'utf8');
const problems=[];
const requireTrue=(condition,message)=>{if(!condition)problems.push(message)};
const base='src/main/resources/db/migration/';
const migrations=readdirSync(base).filter(f=>/^V\d+__.+\.sql$/.test(f));
requireTrue(new Set(migrations.map(f=>f.match(/^V(\d+)/)[1])).size===migrations.length,'Trùng version migration');
requireTrue(migrations.includes('V1__educonnect_schema.sql')&&migrations.includes('V2__reference_data.sql'),'Thiếu V1/V2');
requireTrue(migrations.includes('V3__require_group_capacity_and_dates.sql'),'Thiếu hardening CHECK nullable V3');
const schema=read(base+'V1__educonnect_schema.sql');
const seed=read('database/02_seed_dev.sql');
const verify=read('database/03_verify.sql');
const definitions=[...schema.matchAll(/CREATE TABLE (\w+) \(([\s\S]*?)\n\) ENGINE=InnoDB/g)];
requireTrue(definitions.length===51,'Cần 51 bảng');
requireTrue((schema.match(/CREATE VIEW /g)||[]).length===4,'Cần 4 views');
requireTrue((schema.match(/DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci/g)||[]).length===51,'Engine/charset/collation mỗi table');
requireTrue(!/\b(FLOAT|DOUBLE|TIMESTAMPTZ|SERIAL|JSONB)\b/.test(schema),'Sai type tiền/dialect');
requireTrue(!/ON DELETE CASCADE/i.test(schema),'Cascade lịch sử');
requireTrue(!/INSERT IGNORE|FOREIGN_KEY_CHECKS\s*=\s*0|NOW\s*\(|RAND\s*\(|TRUNCATE|\bDROP TABLE\b|\bDROP DATABASE\b/i.test(seed),'Seed có operation bị cấm');
requireTrue(/START TRANSACTION;[\s\S]*COMMIT;/.test(seed)&&/ROLLBACK;/.test(seed)&&/RESIGNAL;/.test(seed),'Seed thiếu transaction/handler');
requireTrue(seed.includes("DATABASE()='educonnect_dev'")&&seed.includes('^educonnect_test'),'Seed thiếu DB guard');
requireTrue(seed.includes('UNCHANGED_NOOP')&&seed.includes('manifest_hash')&&seed.includes('<=>'),'Seed thiếu strict rerun');
const embedded=/SET v_hash=UNHEX\('([a-f0-9]{64})'\)/.exec(seed);
const calculated=createHash('sha256').update(seed.replace(/SET v_hash=UNHEX\('[^']*'\)/,"SET v_hash=UNHEX('MANIFEST')")).digest('hex');
requireTrue(embedded?.[1]===calculated,'Manifest seed không khớp nội dung chuẩn hóa');
requireTrue(!existsSync('database/01_schema.sql'),'Có bộ DDL thứ hai');
const mapping=read('docs/database/FEATURE_MAPPING.md');
for(const id of [...Array.from({length:13},(_,i)=>'BB'+String(i+1).padStart(2,'0')),...Array.from({length:10},(_,i)=>'TC'+String(i+1).padStart(2,'0'))])
  requireTrue(mapping.includes('| '+id+' |'),'Thiếu '+id);
const dictionary=read('docs/database/SCHEMA.md');
for(const [ , table] of definitions)requireTrue(dictionary.includes('### '+table+'\n'),'Thiếu dictionary '+table);
for(const p of ['database/README.md','docs/database/SCHEMA.md','docs/database/DECISIONS.md','docs/database/FEATURE_MAPPING.md','docs/database/TEST_RESULTS.md']){
  const text=read(p);
  requireTrue(!/C:\\Users\\|D:\\project|feature\/ui-/.test(text),'Lộ path/nhánh cá nhân trong '+p);
}
const profile=read('src/main/resources/application-db-dev.yml');
requireTrue(profile.includes('ddl-auto: validate')&&profile.includes('mode: never')&&profile.includes('baseline-on-migrate: false')&&profile.includes('clean-disabled: true'),'Config không giữ Flyway ownership');
requireTrue((verify.match(/^-- EXPECT_ZERO:/gm)||[]).length>=30,'Thiếu invariant queries');
problems.forEach(p=>console.error('FAIL: '+p));
console.log('Database static checks: '+(problems.length?'FAIL':'PASS')+'; tables='+definitions.length+'; migrations='+migrations.length);
if(problems.length)process.exit(1);

