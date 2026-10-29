require('dotenv').config({path:require('path').join(__dirname,'.env')});
const express=require('express');
const path=require('path');
const bcrypt=require('bcrypt');
const session=require('express-session');
const {db,getMonthlyReport}=require('./database');
const app=express();
const PORT=Number(process.env.PORT)||4001;
if(!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length<32) throw new Error('SESSION_SECRET .env faylida kamida 32 belgi bolishi kerak');
app.disable('x-powered-by');
app.use(express.json({limit:'20kb'}));
app.use(session({name:'ziyokor.sid',secret:process.env.SESSION_SECRET,resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:false,maxAge:8*60*60*1000}}));
const requireAdmin=(req,res,next)=>req.session?.adminId?next():res.status(401).json({message:'Admin sifatida kiring'});
const publicDir=path.join(__dirname,'public');
app.get('/admin.html',(req,res)=>req.session?.adminId?res.sendFile(path.join(publicDir,'admin.html')):res.redirect('/admin-login.html'));
app.use(express.static(publicDir,{index:'index.html'}));
const courses=[{id:1,name:'Frontend dasturlash'},{id:2,name:'Backend dasturlash'},{id:3,name:'Ingliz tili'},{id:4,name:'Matematika'},{id:5,name:'Python dasturlash'},{id:6,name:'Rus tili'}];
app.get('/api/courses',(req,res)=>res.json(courses));
app.post('/api/applications',(req,res)=>{
 const {fullName,phone,course}=req.body||{};
 if(typeof fullName!=='string'||fullName.trim().length<3||fullName.length>100||typeof phone!=='string'||!/^[+]?[0-9\s()-]{9,20}$/.test(phone.trim())||!courses.some(c=>c.name===course)) return res.status(400).json({message:'Malumotlarni togri kiriting'});
 try{db.prepare('INSERT INTO applications(fullName,phone,course) VALUES(?,?,?)').run(fullName.trim(),phone.trim(),course);res.status(201).json({message:'Arizangiz muvaffaqiyatli qabul qilindi!'});}catch(e){console.error(e);res.status(500).json({message:'Server xatosi'});}
});
// Login urinishlarini localhost sinovi uchun oddiy cheklash
const attempts=new Map();
app.post('/api/admin/login',async(req,res)=>{
 const {username,password}=req.body||{};const ip=req.ip;const now=Date.now();let a=attempts.get(ip)||{count:0,until:now+15*60*1000};if(now>a.until)a={count:0,until:now+15*60*1000};
 if(a.count>=10)return res.status(429).json({message:'Kop urinish. 15 daqiqadan keyin urinib koring'});
 if(typeof username!=='string'||typeof password!=='string'||username.length>100||password.length>200)return res.status(400).json({message:'Login va parolni kiriting'});
 try{const admin=db.prepare('SELECT id,password_hash FROM admins WHERE username=?').get(username);const valid=admin?await bcrypt.compare(password,admin.password_hash):false;
 if(!valid){a.count++;attempts.set(ip,a);return res.status(401).json({message:'Login yoki parol notogri'});}attempts.delete(ip);
 req.session.regenerate(err=>{if(err)return res.status(500).json({message:'Sessiya xatosi'});req.session.adminId=admin.id;req.session.save(err=>err?res.status(500).json({message:'Sessiya saqlanmadi'}):res.json({message:'Muvaffaqiyatli kirildi'}));});
 }catch(e){console.error(e);res.status(500).json({message:'Server xatosi'});}
});
app.get('/api/admin/me',requireAdmin,(req,res)=>res.json({loggedIn:true}));
app.post('/api/admin/logout',(req,res)=>req.session.destroy(err=>{if(err)return res.status(500).json({message:'Chiqishda xatolik'});res.clearCookie('ziyokor.sid');res.json({message:'Chiqildi'});}));
app.use('/api/admin',requireAdmin);
const fail=(res,e)=>{console.error(e);res.status(500).json({message:'Server xatosi'});};
const monthOK=m=>typeof m==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(m);
const validStudent=x=>typeof x.full_name==='string'&&x.full_name.trim().length>=3&&x.full_name.length<=100&&typeof x.course==='string'&&courses.some(c=>c.name===x.course)&&Number.isSafeInteger(x.monthly_fee)&&x.monthly_fee>=0&&typeof(x.phone??'')==='string'&&(x.phone??'').length<=30&&typeof(x.group_name??'')==='string'&&(x.group_name??'').length<=80;
app.get('/api/admin/students',(req,res)=>{try{res.json(db.prepare('SELECT * FROM students ORDER BY id DESC').all());}catch(e){fail(res,e);}});
app.post('/api/admin/students',(req,res)=>{const x=req.body||{};if(!validStudent(x))return res.status(400).json({message:'Oquvchi malumotlari notogri'});try{const r=db.prepare('INSERT INTO students(full_name,phone,course,group_name,monthly_fee) VALUES(?,?,?,?,?)').run(x.full_name.trim(),x.phone||'',x.course,x.group_name||'',x.monthly_fee);res.status(201).json({message:'Oquvchi qoshildi',id:Number(r.lastInsertRowid)});}catch(e){fail(res,e);}});
app.put('/api/admin/students/:id',(req,res)=>{const id=Number(req.params.id),x=req.body||{};if(!Number.isSafeInteger(id)||id<1||!validStudent(x)||![0,1].includes(x.active))return res.status(400).json({message:'Malumotlar notogri'});try{const r=db.prepare('UPDATE students SET full_name=?,phone=?,course=?,group_name=?,monthly_fee=?,active=? WHERE id=?').run(x.full_name.trim(),x.phone||'',x.course,x.group_name||'',x.monthly_fee,x.active,id);if(!r.changes)return res.status(404).json({message:'Oquvchi topilmadi'});res.json({message:'Oquvchi yangilandi'});}catch(e){fail(res,e);}});
app.get('/api/admin/applications',(req,res)=>{try{res.json(db.prepare('SELECT * FROM applications ORDER BY id DESC').all());}catch(e){fail(res,e);}});
app.delete('/api/admin/applications/:id',(req,res)=>{const id=Number(req.params.id);if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({message:'ID notogri'});try{const r=db.prepare('DELETE FROM applications WHERE id=?').run(id);res.status(r.changes?200:404).json({message:r.changes?'Ariza ochirildi':'Ariza topilmadi'});}catch(e){fail(res,e);}});
app.post('/api/admin/monthly-fees',(req,res)=>{const {month}=req.body||{};if(!monthOK(month))return res.status(400).json({message:'Oy YYYY-MM bolishi kerak'});try{const tx=db.transaction(()=>{const students=db.prepare('SELECT id,monthly_fee FROM students WHERE active=1').all();const insert=db.prepare('INSERT OR IGNORE INTO monthly_fees(student_id,month,amount) VALUES(?,?,?)');let added=0;for(const s of students)added+=insert.run(s.id,month,s.monthly_fee).changes;return added;});res.json({message:'Oylik hisoblar tayyor',added:tx()});}catch(e){fail(res,e);}});
app.get('/api/admin/payments',(req,res)=>{if(!monthOK(req.query.month))return res.status(400).json({message:'Oy YYYY-MM bolishi kerak'});try{res.json(getMonthlyReport.all(req.query.month));}catch(e){fail(res,e);}});
app.post('/api/admin/payments',(req,res)=>{const {student_id,month,amount,payment_method}=req.body||{};if(!Number.isSafeInteger(student_id)||student_id<1||!monthOK(month)||!Number.isSafeInteger(amount)||amount<=0||!['cash','card','transfer'].includes(payment_method))return res.status(400).json({message:'Tolov malumotlari notogri'});
 try{const tx=db.transaction(()=>{const fee=db.prepare('SELECT id,amount FROM monthly_fees WHERE student_id=? AND month=?').get(student_id,month);if(!fee)return{status:404,message:'Bu oy uchun hisob topilmadi'};const paid=db.prepare('SELECT COALESCE(SUM(amount),0) total FROM payments WHERE monthly_fee_id=?').get(fee.id).total;if(amount>fee.amount-paid)return{status:400,message:'Tolov qolgan qarzdan oshdi'};db.prepare('INSERT INTO payments(monthly_fee_id,amount,payment_method) VALUES(?,?,?)').run(fee.id,amount,payment_method);return{status:201,message:'Tolov saqlandi'};});const result=tx();res.status(result.status).json({message:result.message});}catch(e){fail(res,e);}
});
app.get('/api/admin/payment-history',(req,res)=>{try{res.json(db.prepare(`SELECT p.id,s.full_name,m.month,p.amount,p.payment_method,p.paid_at FROM payments p JOIN monthly_fees m ON m.id=p.monthly_fee_id JOIN students s ON s.id=m.student_id ORDER BY p.id DESC LIMIT 200`).all());}catch(e){fail(res,e);}});
app.listen(PORT,()=>console.log(`Ziyokor server: http://localhost:${PORT}`));
