const { chromium } = require('C:/Users/Usuario/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({headless:true, channel:'msedge'});
 const context = await browser.newContext({viewport:{width:390,height:844}, deviceScaleFactor:1});
 const user={id:'fixture-user',email:'ana@example.test',app_metadata:{},user_metadata:{},aud:'authenticated',created_at:new Date().toISOString()};
 const token = ['eyJhbGciOiJIUzI1NiJ9',Buffer.from(JSON.stringify({sub:user.id,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),'fixture'].join('.');
 const session={access_token:token,refresh_token:'fixture-refresh',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user};
 await context.addCookies([{name:'sb-127-auth-token',value:'base64-'+Buffer.from(JSON.stringify(session)).toString('base64url'),url:'http://localhost:3100'}]);
 const now=new Date().toISOString();
 const expenses=[
  {id:'e1',title:'Supermercado del barrio',amount:2480.5,currency:'UYU',date:now,type:'supermarket',movementType:'EXPENSE',category:'supermercado',items:[]},
  {id:'e2',title:'Almuerzo',amount:890,currency:'UYU',date:now,type:'variable',movementType:'EXPENSE',category:'delivery',items:[]},
  {id:'e3',title:'Sueldo',amount:58000,currency:'UYU',date:now,type:'variable',movementType:'INCOME',category:'salario',items:[]},
  {id:'e4',title:'Suscripción de trabajo',amount:25,currency:'USD',date:now,type:'fixed',movementType:'EXPENSE',category:'internet',items:[]}
 ];
 let messages=[]; let posts=0; let confirmations=0; let fail=false;
 await context.route('**/*', async route => {
  const url=new URL(route.request().url());
  if(url.port==='3100') return route.continue(); console.log('fixture request',url.origin,url.pathname);
  const json=(body,status=200)=>route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'},body:JSON.stringify(body)});
  if(route.request().method()==='OPTIONS') return json({});
  if(url.port!=='3101' && url.port!=='54321') return route.abort();
  if(url.pathname==='/api/me') return json({id:'p1',email:user.email,displayName:'Ana',color:'#407E8C',avatarUrl:null});
  if(url.pathname==='/api/personal-finance') return json(expenses);
  if(url.pathname==='/api/ai/chat/active') return json({id:'c1',profileId:'p1',title:'Charla con Finnic'});
  if(url.pathname==='/api/ai/conversations/c1/messages') return json(messages);
  if(url.pathname==='/api/ai/chat' && route.request().method()==='POST') {
    posts++;
    if(fail) return json({message:'internal sensitive failure'},503);
    const body=route.request().postDataJSON();
    messages.push({id:'u'+posts,role:'USER',content:body.message,conversationId:'c1',createdAt:now});
    messages.push({id:'a'+posts,role:'ASSISTANT',content:'Registrar gasto de $ 450,00: "Almuerzo". Categoría: "delivery". Cuenta: "Efectivo" (UYU). Fecha: 2026-09-05.',conversationId:'c1',createdAt:now,metadata:{kind:'action',pendingActionId:'pending-1',actionStatus:'pending'}});
    return json({text:messages.at(-1).content,conversationId:'c1',pendingActionId:'pending-1'});
  }
  if(url.pathname==='/api/ai/actions/pending-1/confirm') {
   confirmations++; messages=messages.map(m=>m.metadata?.pendingActionId?{...m,metadata:{...m.metadata,actionStatus:'completed'}}:m);
   messages.push({id:'done',role:'ASSISTANT',content:'Listo, el gasto fue registrado. Podés revisarlo en [Finanzas](/finanzas).',metadata:{kind:'action',actionStatus:'completed'},conversationId:'c1',createdAt:now});
   return json({text:'Listo',conversationId:'c1'});
  }
  if(url.pathname==='/api/finance/accounts') return json([{id:'cash',profileId:'p1',name:'Efectivo',type:'CASH',currency:'UYU',balance:15800,isActive:true,isSpendable:true},{id:'usd',profileId:'p1',name:'Ahorro en dólares',type:'BANK',currency:'USD',balance:850,isActive:true,isSpendable:false},{id:'card',profileId:'p1',name:'Tarjeta',type:'CREDIT',currency:'UYU',balance:4700,isActive:true,isSpendable:false}]);
  if(url.pathname==='/api/finance/snapshot') return json({balances:{spendableByCurrency:{UYU:'15800.00'},creditDebtByCurrency:{UYU:'4700.00'}},asOf:now});
  if(url.pathname==='/api/households')return json([]);
  if(url.pathname==='/api/expenses')return json({items:[],pagination:{limit:20,offset:0,hasMore:false},summary:{month:'2026-09',totalSpent:0,fixedTotal:0,variableTotal:0,supermarketTotal:0,householdTotal:0,personalTotal:0,itemsCount:0}});
  if(url.port==='54321')return json({user});
  return json([]);
 });
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error')console.log('browser',m.text())}); page.on('requestfailed',r=>console.log('failed',r.url(),r.failure()));
 fs.mkdirSync('docs/verification',{recursive:true});
 for(const size of [{name:'mobile',width:390,height:844},{name:'desktop',width:1440,height:1000}]) {
  await page.setViewportSize(size);
  for(const theme of ['light','dark']){
   await page.goto('http://localhost:3100/dashboard');
   await page.evaluate(theme=>{localStorage.setItem('theme',theme);document.documentElement.classList.toggle('dark',theme==='dark')},theme);
   await page.getByText('Dónde se va tu dinero').waitFor({timeout:15000}).catch(async e=>{console.log(await page.locator('body').innerText());console.log(errors);await page.screenshot({path:'tmp/visual-failure.png'});throw e});
   await page.getByText('Supermercado del barrio').waitFor();
   await page.screenshot({path:`docs/verification/dashboard-${size.name}-${theme}.png`,fullPage:true});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   if(overflow) throw new Error('Dashboard overflow '+size.name);
   await page.goto('http://localhost:3100/chat');
   await page.getByText('Tus números, más claros.').waitFor();
   await page.screenshot({path:`docs/verification/chat-${size.name}-${theme}.png`,fullPage:true});
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.getByLabel('Mensaje para Finnic').fill('Registrá un almuerzo de 450 pesos');
 await page.getByRole('button',{name:'Enviar mensaje',exact:true}).click();
 await page.getByRole('button',{name:'Confirmar gasto'}).waitFor();
 await page.screenshot({path:'docs/verification/chat-proposal-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Confirmar gasto'}).dblclick();
 await page.getByRole('link',{name:'Finanzas',exact:true}).waitFor();
 if(confirmations!==1)throw new Error('Double confirmation sent '+confirmations);
 await page.screenshot({path:'docs/verification/chat-completed-mobile.png',fullPage:true});
 fail=true;
 await page.getByLabel('Mensaje para Finnic').fill('Texto que se debe conservar');
 await page.getByRole('button',{name:'Enviar mensaje',exact:true}).click();
 await page.getByText('No pudimos verificar la respuesta.',{exact:false}).waitFor();
 if(await page.getByLabel('Mensaje para Finnic').inputValue()!=='Texto que se debe conservar')throw new Error('Draft lost');
 await page.screenshot({path:'docs/verification/chat-error-mobile.png',fullPage:true});
 await page.goto('http://localhost:3100/finanzas');
 await page.getByRole('heading',{name:'Resumen de egresos · UYU'}).waitFor();
 await page.getByRole('button',{name:'USD',exact:true}).click();
 await page.getByRole('heading',{name:'Resumen de egresos · USD'}).waitFor();
 await page.screenshot({path:'docs/verification/finanzas-usd-mobile.png',fullPage:true});
 console.log(JSON.stringify({errors,posts,confirmations,result:'fixtures passed'}));
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});





