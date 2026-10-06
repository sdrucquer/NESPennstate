(() => {
 const form=document.getElementById('join-form'),status=document.getElementById('join-status'),button=document.getElementById('submit');
 const nameInput=document.getElementById('name'),emailInput=document.getElementById('email'),websiteInput=document.getElementById('website');
 let token='',widget,busy=false;
 const reset=()=>{token='';button.disabled=true;if(window.turnstile&&widget!==undefined)window.turnstile.reset(widget);};
 async function setup(){
  try{
   const response=await fetch('/join/config',{cache:'no-store'});const config=await response.json();if(!response.ok)throw new Error(config.error);
   await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.onload=resolve;script.onerror=()=>reject(new Error('The bot check could not load. Refresh to try again.'));document.head.append(script);});
   widget=window.turnstile.render('#bot-check',{sitekey:config.siteKey,action:'nes_join',theme:'light',size:'flexible',callback:value=>{token=value;button.disabled=busy;status.textContent='Bot check passed. You’re ready to continue.';},'expired-callback':()=>{token='';button.disabled=true;status.textContent='The bot check expired. Please complete it again.';},'error-callback':()=>{token='';button.disabled=true;status.textContent='The bot check couldn’t finish. Refresh to try again.';}});
   status.textContent='Complete the bot check to continue.';
  }catch(error){status.textContent=error.message||'Joining is temporarily unavailable. Please check back soon.';}
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||!form.reportValidity()||!token)return;
  if(!/^[^@\s]+@psu\.edu$/i.test(emailInput.value.trim())){status.textContent='Please use your Penn State email ending in @psu.edu.';emailInput.focus();return;}
  busy=true;button.disabled=true;status.textContent='Checking…';
  try{
   const response=await fetch('/join/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:nameInput.value.trim(),email:emailInput.value.trim(),website:websiteInput.value,token})});const result=await response.json();if(!response.ok)throw new Error(result.error);
   const url=new URL(result.inviteUrl);if(url.protocol!=='https:'||url.hostname!=='groupme.com')throw new Error('The invite is temporarily unavailable.');
   document.getElementById('invite').href=url.href;form.hidden=true;const success=document.getElementById('join-success');success.hidden=false;success.setAttribute('tabindex','-1');success.focus();form.reset();token='';
  }catch(error){status.textContent=error.message||'Couldn’t connect. Please try again.';reset();}finally{busy=false;button.disabled=!token;}
 });setup();
})();
