const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, 'showcase-hub.sqlite'));
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK(kind IN ('consultation','project')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  details TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','declined','completed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(date,time,status);
`);
app.use(express.json({limit:'30kb'}));
app.use(express.static(path.join(__dirname,'public')));

const clean = (v,max=2000) => String(v ?? '').trim().slice(0,max);
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value+'T00:00:00'));
app.post('/api/bookings',(req,res)=>{
  const b=req.body||{};
  const kind=clean(b.kind,20), name=clean(b.name,100), email=clean(b.email,160), phone=clean(b.phone,40);
  const service=clean(b.service,100), date=clean(b.date,10), time=clean(b.time,5), details=clean(b.details,2000);
  if(!['consultation','project'].includes(kind)) return res.status(400).json({error:'Choose consultation or project booking.'});
  if(!name||!email||!phone||!service||!validDate(date)||!/^([01]\d|2[0-3]):00$/.test(time)) return res.status(400).json({error:'Please complete all required fields with a valid date and time.'});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({error:'Enter a valid email address.'});
  if(date < new Date().toISOString().slice(0,10)) return res.status(400).json({error:'Please choose a future date.'});
  if(kind==='consultation'){
    const conflict=db.prepare("SELECT reference FROM bookings WHERE date=? AND time=? AND kind='consultation' AND status IN ('pending','confirmed')").get(date,time);
    if(conflict) return res.status(409).json({error:'That consultation slot has already been requested. Please choose another time.'});
  }
  const reference='SH-'+crypto.randomBytes(3).toString('hex').toUpperCase();
  db.prepare('INSERT INTO bookings(reference,kind,name,email,phone,service,date,time,details) VALUES(?,?,?,?,?,?,?,?,?)').run(reference,kind,name,email,phone,service,date,time,details);
  res.status(201).json({ok:true,reference});
});

function adminOnly(req,res,next){
  const key=process.env.ADMIN_KEY;
  if(!key) return res.status(503).json({error:'Admin access is not configured. Set ADMIN_KEY on the server.'});
  const supplied=req.get('x-admin-key') || '';
if (
  Buffer.byteLength(supplied) !== Buffer.byteLength(key) ||
  !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(key))
) {
  return res.status(401).json({ error: 'Invalid admin key.' });
}  next();
}
app.get('/api/admin/bookings',adminOnly,(req,res)=>{
  const rows=db.prepare('SELECT reference,kind,name,email,phone,service,date,time,details,status,created_at FROM bookings ORDER BY created_at DESC LIMIT 250').all();
  res.json(rows);
});
app.patch('/api/admin/bookings/:reference',adminOnly,(req,res)=>{
  const status=clean(req.body?.status,20);
  if(!['pending','confirmed','declined','completed'].includes(status)) return res.status(400).json({error:'Invalid status.'});
  const result=db.prepare('UPDATE bookings SET status=? WHERE reference=?').run(status,clean(req.params.reference,30));
  if(!result.changes) return res.status(404).json({error:'Booking not found.'});
  res.json({ok:true});
});
app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'public','admin.html')));
app.listen(PORT,()=>console.log(`SHOWCASE HUB running on http://localhost:${PORT}`));
